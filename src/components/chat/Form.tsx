import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '../ui/Button';

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select fields
}

const Form = ({ fields }: { fields: FieldConfig[] }) => {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log('Form Data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2">
      {fields.map((field, index) => (
        <div key={index} className="space-y-1">
          <label className="block text-sm whitespace-nowrap">{index+1}. {field.label}</label>
          <Controller
            name={field.name}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => {
              if (field.type === 'select') {
                return (
                  <select
                    value={value}
                    onChange={onChange}
                    className="ml-3 w-full px-1 py-[0.15rem] rounded-sm"
                  >
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );
              }
              return (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={onChange}
                  className="ml-3 w-full px-1 py-[0.15rem] rounded-sm"
                />
              );
            }}
          />
        </div>
      ))}

      <div className="w-full flex justify-end ml-3">
        <Button
            onClick={() => {}}
          type="submit"
          className="font-arial text-xs py-1 px-2 rounded-sm bg-black text-white mt-2"
        >
          SUBMIT
        </Button>
      </div>
    </form>
  );
};

export default Form;
