import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Teacher } from "@/types";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BasicInfoSection } from "./teacher-form/BasicInfoSection";
import { PersonalInfoSection } from "./teacher-form/PersonalInfoSection";
import { ProfessionalInfoSection } from "./teacher-form/ProfessionalInfoSection";
import { ContactInfoSection } from "./teacher-form/ContactInfoSection";
import { EmergencyInfoSection } from "./teacher-form/EmergencyInfoSection";

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
}

export function EditTeacherDialog({
  open,
  onOpenChange,
  teacher,
}: EditTeacherDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      // Basic Details
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      // Personal Details
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth || '',
      nationality: teacher.nationality || '',
      religion: teacher.religion || '',
      maritalStatus: teacher.maritalStatus || '',
      bloodGroup: teacher.bloodGroup || '',
      // Professional Details
      employeeId: teacher.professionalDetails?.employeeId || '',
      designation: teacher.professionalDetails?.designation || '',
      department: teacher.professionalDetails?.department || '',
      joiningDate: teacher.professionalDetails?.joiningDate || '',
      employmentType: teacher.professionalDetails?.employmentType || 'Full-time',
      // Contact Information
      currentAddress: teacher.contactInformation?.currentAddress || '',
      permanentAddress: teacher.contactInformation?.permanentAddress || '',
      personalPhone: teacher.contactInformation?.personalPhone || '',
      schoolPhone: teacher.contactInformation?.schoolPhone || '',
      personalEmail: teacher.contactInformation?.personalEmail || '',
      schoolEmail: teacher.contactInformation?.schoolEmail || '',
      // Emergency Contact
      emergencyContactName: teacher.emergency?.contactName || '',
      emergencyRelationship: teacher.emergency?.relationship || '',
      emergencyPhone: teacher.emergency?.phone || '',
      // Medical Information
      medicalConditions: teacher.medicalInformation?.conditions?.join(', ') || '',
      allergies: teacher.medicalInformation?.allergies?.join(', ') || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Submitting form with data:", data);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        })
        .eq('id', teacher.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Update teacher details
      const { error: detailsError } = await supabase
        .from('teacher_details')
        .update({
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          nationality: data.nationality,
          contact_info: {
            currentAddress: data.currentAddress,
            permanentAddress: data.permanentAddress,
            personalPhone: data.personalPhone,
            schoolPhone: data.schoolPhone,
            personalEmail: data.personalEmail,
            schoolEmail: data.schoolEmail,
          },
          professional_info: {
            employeeId: data.employeeId,
            designation: data.designation,
            department: data.department,
            joiningDate: data.joiningDate,
            employmentType: data.employmentType,
            subjects: teacher.professionalDetails?.subjects || [],
            classesAssigned: teacher.professionalDetails?.classesAssigned || [],
            qualifications: teacher.professionalDetails?.qualifications || [],
            specializations: teacher.professionalDetails?.specializations || [],
          },
          emergency_contact: {
            name: data.emergencyContactName,
            relationship: data.emergencyRelationship,
            phone: data.emergencyPhone,
          },
          medical_info: {
            conditions: data.medicalConditions ? data.medicalConditions.split(',').map(item => item.trim()).filter(Boolean) : [],
            allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()).filter(Boolean) : [],
          },
        })
        .eq('id', teacher.id);

      if (detailsError) {
        console.error("Error updating teacher details:", detailsError);
        throw detailsError;
      }

      toast({
        title: "Success",
        description: "Teacher details updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({
        title: "Error",
        description: "Failed to update teacher details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Teacher Details</DialogTitle>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
