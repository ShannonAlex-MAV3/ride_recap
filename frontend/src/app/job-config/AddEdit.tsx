//@ts-nocheck
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { fetchJobConfig, formSchema, JobConfig, createJob, updateJob } from "./Utills";
import { Textarea } from "@/components/ui/textarea";

const AddEditJob = () => {
  const { jobID } = useParams<{ jobID: string }>();
  const [jobData, setJobData] = useState<JobConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobCode: "",
      jobName: "",
      description: "",
      category: "",
      status: "",
    },
  });

  useEffect(() => {
    if (jobID) {
      setIsEditing(true);
      const loadJob = async () => {
        const jobs = await fetchJobConfig();
        const jobToEdit = jobs.find((j) => j.jobID === Number(jobID));
        if (jobToEdit) {
          setJobData(jobToEdit);
          form.reset({
            jobCode: jobToEdit.jobCode,
            jobName: jobToEdit.jobName,
            description: jobToEdit.description,
            category: jobToEdit.category,
            status: jobToEdit.status,
          });
        }
      };
      loadJob();
    } else {
      setIsEditing(false);
    }
  }, [jobID]);

  const submitJob = (formVals: any) => {
    const updateRQ ={
      ...jobData,
      ...formVals
    }
    isEditing ? updateJob(updateRQ) : createJob(updateRQ)
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit Job" : "Add New Job"}
      </h1>

      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit((submitJob))}>
          <FormField
            control={form.control}
            name="jobCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">
                  Job Code
                </FormLabel>
                <Input
                  {...field}
                  className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                  disabled
                  placeholder="Code will auto generated."
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">
                  Job Name
                </FormLabel>
                <Input
                  {...field}
                  className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                  required
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">
                  Description
                </FormLabel>
                <Textarea
                  {...field}
                  className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">
                  Job Category
                </FormLabel>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-4/5">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GM">General Maintenance</SelectItem>
                    <SelectItem value="ID">
                      Inspections and Diagnostics
                    </SelectItem>
                    <SelectItem value="ER">
                      Engine Repair & Maintenance
                    </SelectItem>
                    <SelectItem value="BS">Brakes and Suspension:</SelectItem>
                    <SelectItem value="TS">Transmission Services</SelectItem>
                    <SelectItem value="AC">
                      HVAC (Heating, Ventilation, Air Conditioning)
                    </SelectItem>
                    <SelectItem value="BP">Body and Paintwork</SelectItem>
                    <SelectItem value="TW">Tires and Wheels</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium">
                  Status
                </FormLabel>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-4/5">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACT">Active</SelectItem>
                    <SelectItem value="INA">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="flex space-x-4">
            <Button type="submit" className="btn btn-primary">
              {isEditing ? "Save Changes" : "Add Job"}
            </Button>
            <Button
              type="reset"
              className="btn btn-secondary"
              onClick={() => form.reset({
                jobCode: jobData?.jobCode ?? "",
                jobName: jobData?.jobName ?? "",
                description: jobData?.description ?? "",
                category: jobData?.category ?? "",
                status: jobData?.status ?? "",
              })}
            >
              Discard
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
};
export default AddEditJob;
