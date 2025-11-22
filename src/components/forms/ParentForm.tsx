"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";

import InputField from "../InputField";

import { createParent, updateParent } from "@/lib/actions";
import { ParentSchema, parentSchema } from "@/lib/formValidationSchemas";

type ParentFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ParentForm = ({ type, data, setOpen }: ParentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [router, setOpen, state.success, type]);

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, id: data?.id });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Add guardian" : "Update guardian"}
      </h1>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email || ""}
          register={register}
          error={errors.email}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone || ""}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address || ""}
          register={register}
          error={errors.address}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="First name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
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
          {type === "create" ? "Create guardian" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default ParentForm;
