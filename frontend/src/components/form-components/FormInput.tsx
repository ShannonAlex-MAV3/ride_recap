import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { InputHTMLAttributes } from "react";

interface FormInputProps<TFormValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormValues>;
  name:  Path<TFormValues>;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'placeholder' | 'disabled'>;
}

export default function FormInput<TFormValues extends FieldValues = FieldValues>(props: FormInputProps<TFormValues>) {
    const { form, name, label, type = "text", required = false, placeholder, description, disabled, inputProps } = props;
    return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{`${label} `} {required && <span className="text-red-500">*</span>}</FormLabel>}
          <FormControl>
            <Input type={type} placeholder={placeholder} disabled={disabled} {...inputProps} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
