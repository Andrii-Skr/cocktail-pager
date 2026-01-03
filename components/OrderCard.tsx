"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { OrderWithCocktail } from "@/types/types"

const GUEST_NAME_SENTINEL = "Guest"
const NAME_MAX = 100
const NOTE_MAX = 500

type FormValues = {
  name: string
  note: string
}

interface Props {
  order: OrderWithCocktail
  onSave: () => void // вызывается после любого PATCH
}

export function OrderCard({ order, onSave }: Props) {
  const t = useTranslations("orderCard")
  const tv = useTranslations("validation")

  const currentName = order.user?.name ?? GUEST_NAME_SENTINEL
  const isGuest = !order.user?.name || order.user?.name === GUEST_NAME_SENTINEL
  const formName = isGuest ? "" : currentName

  const [status, setStatus] = useState(order.status)
  const userId = order.userId // <— это связь на Users.deviceId

  const nameSchema = useMemo(
    () => z.string().trim().max(NAME_MAX, tv("nameMax")),
    [tv]
  )
  const noteSchema = useMemo(
    () => z.string().max(NOTE_MAX, tv("noteMax")),
    [tv]
  )
  const formSchema = useMemo(
    () => z.object({ name: nameSchema, note: noteSchema }),
    [nameSchema, noteSchema]
  )

  const {
    register,
    getValues,
    reset,
    setValue,
    trigger,
    getFieldState,
    formState,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formName,
      note: order.note ?? "",
    },
  })

  const isSavingUser = useRef(false)
  const orderPatchQueue = useRef(Promise.resolve())

  useEffect(() => {
    reset({
      name: formName,
      note: order.note ?? "",
    })
    setStatus(order.status)
  }, [order.note, order.status, formName, reset])

  type OrderPatch = {
    note?: string | null
    status?: OrderWithCocktail["status"]
  }

  /* PATCH заказ (с очередью, чтобы не терять клики) */
  const enqueueOrderPatch = (data: OrderPatch, rollback?: () => void) => {
    orderPatchQueue.current = orderPatchQueue.current.then(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          throw new Error(t("updateOrderError"))
        }
        onSave()
      } catch (err) {
        if (rollback) rollback()
        const message =
          err instanceof Error && err.message
            ? err.message
            : t("updateOrderError")
        toast.error(message)
      }
    })
  }

  /* PATCH имя пользователя в Users (по deviceId == userId) */
  const patchUser = async (newName: string) => {
    if (!userId) return
    if (isSavingUser.current) return

    const trimmed = newName.trim()
    if (!trimmed || trimmed === currentName) return
    if (trimmed === GUEST_NAME_SENTINEL) return

    isSavingUser.current = true
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        throw new Error(t("updateNameError"))
      }
      onSave()
    } catch (err) {
      setValue("name", formName)
      const message =
        err instanceof Error && err.message ? err.message : t("updateNameError")
      toast.error(message)
    } finally {
      isSavingUser.current = false
    }
  }

  const handleNameCommit = async () => {
    const isValid = await trigger("name")
    if (!isValid) {
      const fieldState = getFieldState("name")
      if (fieldState.error?.message) {
        toast.error(fieldState.error.message)
      }
      return
    }

    const value = getValues("name").trim()
    if (!value || value === currentName || value === GUEST_NAME_SENTINEL) {
      return
    }

    void patchUser(value)
  }

  const handleNoteCommit = async () => {
    const isValid = await trigger("note")
    if (!isValid) {
      const fieldState = getFieldState("note")
      if (fieldState.error?.message) {
        toast.error(fieldState.error.message)
      }
      return
    }

    const serverNote = order.note ?? ""
    const value = getValues("note")

    if (value !== serverNote) {
      enqueueOrderPatch({ note: value }, () => setValue("note", serverNote))
    }
  }

  const nameField = register("name")
  const noteField = register("note")

  return (
    <div className="rounded-2xl border p-4 mb-4 bg-white shadow">
      <h3 className="font-semibold mb-1 text-black">{order.cocktail.name}</h3>

      {/* Показываем исходный deviceId заказа (это НЕ id юзера) */}
      <p className="text-xs text-gray-500 overflow-x-auto">{order.deviceId}</p>

      {/* Имя пользователя: редактируем, только если он гостевой */}
      {isGuest ? (
        <Input
          {...nameField}
          placeholder={t("guestPlaceholder")}
          aria-invalid={!!formState.errors.name}
          onBlur={(event) => {
            nameField.onBlur(event)
            void handleNameCommit()
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault()
              void handleNameCommit()
            } else if (event.key === "Escape") {
              setValue("name", formName)
              event.currentTarget.blur()
            }
          }}
        />
      ) : (
        <p className="text-sm mt-1 font-medium text-black">{currentName}</p>
      )}

      {/* Примечание */}
      <Textarea
        {...noteField}
        rows={2}
        placeholder={t("notePlaceholder")}
        aria-invalid={!!formState.errors.note}
        onBlur={(event) => {
          noteField.onBlur(event)
          void handleNoteCommit()
        }}
      />

      {/* Кнопки статуса */}
      <div className="flex gap-2 mt-3 text-sm">
        {status !== "IN_PROGRESS" && (
          <Button
            onClick={() => {
              const previousStatus = status
              setStatus("IN_PROGRESS")
              enqueueOrderPatch({ status: "IN_PROGRESS" }, () =>
                setStatus(previousStatus)
              )
            }}
            className="flex-1"
          >
            {t("statusInProgress")}
          </Button>
        )}
        <Button
          onClick={() => {
            const previousStatus = status
            setStatus("DONE")
            enqueueOrderPatch({ status: "DONE" }, () =>
              setStatus(previousStatus)
            )
          }}
          className="flex-1"
        >
          {t("statusDone")}
        </Button>
      </div>
    </div>
  )
}

export default OrderCard
