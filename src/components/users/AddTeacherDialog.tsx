import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoSection } from "./teacher-form/BasicInfoSection";
import { PersonalInfoSection } from "./teacher-form/PersonalInfoSection";
import { ProfessionalInfoSection } from "./teacher-form/ProfessionalInfoSection";
import { ContactInfoSection } from "./teacher-form/ContactInfoSection";
import { EmergencyInfoSection } from "./teacher-form/EmergencyInfoSection";
import { handleDatabaseError } from "@/utils/errorHandlers";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  contactInformation: z.object({
    currentAddress: z.string().min(1, "Current address is required"),
    permanentAddress: z.string().optional(),
    personalPhone: z.string().min(1, "Personal phone is required"),
    schoolPhone: z.string().optional(),
    personalEmail: z.string().email("Invalid personal email"),
    schoolEmail: z.string().email("Invalid school email"),
  }),
  professionalInfo: z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    designation: z.string().min(1, "Designation is required"),
    department: z.string().min(1, "Department is required"),
    joiningDate: z.string().min(1, "Joining date is required"),
    qualifications: z.string().min(1, "Qualifications are required"),
    employmentType: z.enum(["Full-time", "Part-time", "Contractual"]),
  }),
  emergency: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phone: z.string().min(1, "Emergency contact phone is required"),
  }),
  medicalInfo: z.object({
    conditions: z.string().optional(),
    allergies: z.string().optional(),
  }),
});

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeacherDialog({ open, onOpenChange }: AddTeacherDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      gender: "male",
      dateOfBirth: "",
      nationality: "",
      contactInformation: {
        currentAddress: "",
        permanentAddress: "",
        personalPhone: "",
        schoolPhone: "",
        personalEmail: "",
        schoolEmail: "",
      },
      professionalInfo: {
        employeeId: "",
        designation: "",
        department: "",
        joiningDate: "",
        qualifications: "",
        employmentType: "Full-time",
      },
      emergency: {
        name: "",
        relationship: "",
        phone: "",
      },
      medicalInfo: {
        conditions: "",
        allergies: "",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Submitting teacher form with values:", values);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          role: "teacher",
        })
        .select();

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }

      if (!profileData || profileData.length === 0) {
        console.error("No profile data returned after insert");
        throw new Error("Failed to create teacher profile");
      }

      const profileId = profileData[0].id;
      console.log("Created profile with ID:", profileId);

      const medicalData = {
        conditions: values.medicalInfo.conditions ? values.medicalInfo.conditions.split(',').map(item => item.trim()) : [],
        allergies: values.medicalInfo.allergies ? values.medicalInfo.allergies.split(',').map(item => item.trim()) : [],
      };
      
      const professionalData = {
        ...values.professionalInfo,
        qualifications: values.professionalInfo.qualifications ? 
          [values.professionalInfo.qualifications] : [],
        subjects: [],
      };

      const { error: detailsError } = await supabase.rpc('insert_teacher_details', {
        profile_id: profileId,
        gender_type: values.gender,
        birth_date: values.dateOfBirth,
        nationality_val: values.nationality,
        contact_data: values.contactInformation,
        professional_data: professionalData,
        emergency_data: values.emergency,
        medical_data: medicalData
      });

      if (detailsError) {
        console.error("Error inserting teacher details:", detailsError);
        throw detailsError;
      }

      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      toast({
        title: "Success",
        description: "Teacher has been added successfully",
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in teacher form submission:", error);
      const errorMessage = handleDatabaseError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter the teacher's details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <BasicInfoSection form={form} />
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <PersonalInfoSection form={form} />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                <ProfessionalInfoSection form={form} />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <ContactInfoSection form={form} />
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4 mt-4">
                <EmergencyInfoSection form={form} />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Add Teacher</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
