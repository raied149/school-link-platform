
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TeacherDetails } from "@/components/users/TeacherDetails";
import { ArrowLeft } from "lucide-react";

const TeacherDetailPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Details</h1>
          <p className="text-muted-foreground">
            View detailed information about this teacher
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate("/teachers/all")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
      </div>
      
      <TeacherDetails />
    </div>
  );
};

export default TeacherDetailPage;
