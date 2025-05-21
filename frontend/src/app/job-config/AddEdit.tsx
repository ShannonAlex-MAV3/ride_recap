//@ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  formSchema,
  JobConfig,
  createJob,
  updateJob,
} from "./Utils";
import { Textarea } from "@/components/ui/textarea";
import { useMasterStore } from "@/hooks/use-master-store";

const AddEditJob = () => {
  const { jobID } = useParams<{ jobID: string }>();
  const [jobData, setJobData] = useState<JobConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [loading, setLoading] = useState(false);
  const { jobs, fetchJobs, getJobById } = useMasterStore();

  const navigate = useNavigate();

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
      
      // Load the job from the store if available, otherwise fetch jobs first
      const loadJob = async () => {
        if (jobs.length === 0) {
          await fetchJobs();
        }
        
        const jobToEdit = getJobById(Number(jobID));
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
  }, [jobID, jobs, fetchJobs, getJobById, form]);

  const submitJob = async (formVals: any) => {
    const updateRQ = {
      ...jobData,
      ...formVals,
    };

    if (isEditing) {
      const updatedJob = await updateJob(updateRQ);
      setJobData(updatedJob);

      form.reset({
        jobCode: jobToEdit.jobCode,
        jobName: jobToEdit.jobName,
        description: jobToEdit.description,
        category: jobToEdit.category,
        status: jobToEdit.status,
      });
    } else {
      const newJob = await createJob(updateRQ);
      navigate(`/job-config/${newJob.jobID}`);
    }
  };

  // const isNew = jobID ? false : true

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Edit Job" : "Add New Job"}
      </h1>

      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(submitJob)}>
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
                  <FormControl>
                    <Input
                      {...field}
                      className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                      required
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormControl>
                    <Textarea
                      {...field}
                      className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                    />
                  </FormControl>
                  <FormMessage />
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
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-4/5">
                        <SelectValue placeholder="Select Job Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GM">General Maintenance</SelectItem>
                        <SelectItem value="ID">
                          Inspections and Diagnostics
                        </SelectItem>
                        <SelectItem value="ER">
                          Engine Repair & Maintenance
                        </SelectItem>
                        <SelectItem value="BS">
                          Brakes and Suspension
                        </SelectItem>
                        <SelectItem value="TS">
                          Transmission Services
                        </SelectItem>
                        <SelectItem value="AC">
                          HVAC (Heating, Ventilation, Air Conditioning)
                        </SelectItem>
                        <SelectItem value="BP">Body and Paintwork</SelectItem>
                        <SelectItem value="TW">Tires and Wheels</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
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
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="w-4/5">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACT">Active</SelectItem>
                        <SelectItem value="INA">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isEditing ? !form.formState.isDirty : !form.formState.isValid
                }
              >
                {isEditing ? "Save Changes" : "Add Job"}
              </Button>
              <Button
                type="reset"
                className="btn btn-secondary"
                onClick={() =>
                  form.reset({
                    jobCode: jobData?.jobCode ?? "",
                    jobName: jobData?.jobName ?? "",
                    description: jobData?.description ?? "",
                    category: jobData?.category ?? "",
                    status: jobData?.status ?? "",
                  })
                }
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
