"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";

import InputField from "../InputField";

import { createEvent, updateEvent } from "@/lib/actions";
import { EventSchema, eventSchema } from "@/lib/formValidationSchemas";

type EventFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes?: { id: number; name: string }[];
  };
};

const formatDateForInput = (value?: string | Date) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date).toISOString().slice(0, 16);
};

const EventForm = ({ type, data, setOpen, relatedData }: EventFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [router, setOpen, state.success, type]);

  const classes = relatedData?.classes ?? [];

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      classId: formData.classId ?? undefined,
    });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update event"}
      </h1>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors.title}
          defaultValue={data?.title}
        />
        {data?.id && (
          <InputField
            label="Id"
            name="id"
            hidden
            register={register}
            defaultValue={String(data.id)}
          />
        )}
        <InputField
          label="Start"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
          defaultValue={formatDateForInput(data?.startTime)}
        />
        <InputField
          label="End"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
          defaultValue={formatDateForInput(data?.endTime)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Description</label>
        <textarea
          {...register("description")}
          defaultValue={data?.description}
          className="min-h-[120px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm text-[color:var(--color-text-primary)]"
          placeholder="Enter agenda, logistics, or key reminders."
        />
        {errors.description?.message && (
          <p className="text-xs text-red-400">{errors.description.message.toString()}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Attach to class (optional)</label>
        <select
          {...register("classId")}
          defaultValue={data?.classId ?? ""}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[color:var(--color-text-primary)]"
        >
          <option value="">All classes</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
        {errors.classId?.message && (
          <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-accent-primary)] px-6 py-2 text-sm font-semibold text-[#271b70] shadow-sm transition hover:opacity-90"
        >
          {type === "create" ? "Create event" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
