import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";

interface FormCheckboxProps<TFormValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormValues>;
  name:  Path<TFormValues>;
  label?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  options: {
    id: string;
    label: string;
  }[];
}

export default function FormCheckbox<TFormValues extends FieldValues = FieldValues>(props: FormCheckboxProps<TFormValues>) {
    const  { form, name, label, required = false, description, disabled, options } = props;
    return (
        <FormField
          control={form.control}
          name={name}
          render={() => (
            <FormItem>
              <div className="mb-4">
                {label && <FormLabel className="text-base">{`${label} `} {required && <span className="text-red-500">*</span>}</FormLabel>}
                {description && <FormDescription>
                  {description}
                </FormDescription>}
              </div>
              {options.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name={name}
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.id}
                        className="flex flex-row items-center gap-2"
                      >
                        <FormControl>
                          <Checkbox
                          disabled={disabled}
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== option.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
    )
}