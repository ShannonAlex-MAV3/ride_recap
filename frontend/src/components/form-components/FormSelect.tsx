import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface FormInputProps<TFormValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  options: { value: string; label: string }[];
}

export default function FormSelect<TFormValues extends FieldValues = FieldValues>(props: FormInputProps<TFormValues>) {
  const { form, name, label, required = false, placeholder, description, disabled, options } = props;
  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label && (
              <FormLabel>
                {`${label} `} {required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
          </FormLabel>
          <FormControl>
            <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option, index) => (
                  <SelectItem key={`formselect-${name}-${index}-${option.value}`} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
