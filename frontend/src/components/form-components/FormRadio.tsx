import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface FormRadioProps<TFormValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormValues>;
  radioValues: {
    label: string;
    value: string;
  }[];
  name: Path<TFormValues>;
  label: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export default function FormRadio<TFormValues extends FieldValues = FieldValues>(props: FormRadioProps<TFormValues>) {
  const { radioValues, form, name, label, description, disabled } = props;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col"
              disabled={disabled}
            >
              {radioValues.map((radio, index) => (
                <FormItem key={`radio-value-${index}-${radio.value}`} className="flex items-center gap-3">
                  <FormControl>
                    <RadioGroupItem value={radio.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{radio.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
