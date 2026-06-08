"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfessionalForm() {
  const [values, setValues] = useState({
    designation: "",
    department: "",
    experience_years: "",
    previous_company: "",
    skills: "",
    achievements: "",
  });

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // 🔹 Abhi sirf console (API baad me connect karenge)
      console.log("Professional Details:", values);

      toast.success("Professional details saved");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional History</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* DESIGNATION */}
        <div>
          <Label>Current Designation</Label>
          <Input
            value={values.designation}
            onChange={(e) =>
              handleChange("designation", e.target.value)
            }
            placeholder="e.g. Software Engineer"
          />
        </div>

        {/* DEPARTMENT */}
        <div>
          <Label>Department</Label>
          <Input
            value={values.department}
            onChange={(e) =>
              handleChange("department", e.target.value)
            }
            placeholder="e.g. Engineering"
          />
        </div>

        {/* EXPERIENCE */}
        <div>
          <Label>Total Experience (Years)</Label>
          <Input
            type="number"
            value={values.experience_years}
            onChange={(e) =>
              handleChange("experience_years", e.target.value)
            }
            placeholder="e.g. 3"
          />
        </div>

        {/* PREVIOUS COMPANY */}
        <div>
          <Label>Previous Company</Label>
          <Input
            value={values.previous_company}
            onChange={(e) =>
              handleChange("previous_company", e.target.value)
            }
            placeholder="e.g. Infosys"
          />
        </div>

        {/* SKILLS */}
        <div>
          <Label>Skills</Label>
          <Input
            value={values.skills}
            onChange={(e) =>
              handleChange("skills", e.target.value)
            }
            placeholder="React, Node, SQL"
          />
        </div>

        {/* ACHIEVEMENTS */}
        <div>
          <Label>Achievements / Notes</Label>
          <Textarea
            value={values.achievements}
            onChange={(e) =>
              handleChange("achievements", e.target.value)
            }
            placeholder="Any awards, certifications, etc."
          />
        </div>

        <Button onClick={handleSubmit}>
          Save Professional Details
        </Button>
      </CardContent>
    </Card>
  );
}
