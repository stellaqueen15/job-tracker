"use client";
import { useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Job } from "../types/job";
import { CalendarIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewJob() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-CA");

  const [job, setJob] = useState<Partial<Job>>({
    company: "",
    position: "",
    status: "Postulé",
    appliedDate: today,
    notes: "",
    hasFollowedUp: 0,
    canFollowUp: 1,
    followUpDate: "",
    isInteresting: 2,
    jobLink: "",
  });

  const appliedDateAsDate = job.appliedDate
    ? new Date(job.appliedDate)
    : undefined;

  const [open, setOpen] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setJob({ ...job, [name]: target.checked ? 1 : 0 });
    } else if (type === "select-one") {
      const target = e.target as HTMLSelectElement;

      // Si c'est le select "isInteresting" => number
      if (name === "isInteresting") {
        setJob({ ...job, [name]: Number(target.value) });
      } else {
        // Sinon on garde la string (ex: status)
        setJob({ ...job, [name]: target.value });
      }
    } else {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      setJob({ ...job, [name]: target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:3001/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      router.push("/");
    } catch (err) {
      console.error("Erreur lors de l'ajout du job :", err);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Navbar />
      <main className="mx-auto w-[80%] py-6 space-y-4">
        <FieldSet onSubmit={handleSubmit} className="mx-auto w-100">
          <FieldGroup>
            <h1 className="text-3xl font-extrabold text-center text-white">
              Ajouter un job
            </h1>

            <Field className="flex flex-col">
              <FieldLabel className="">Entreprise</FieldLabel>
              <Input
                type="text"
                name="company"
                placeholder="Ex: Google"
                value={job.company}
                onChange={handleChange}
                className=""
                required
              />
            </Field>

            {/* Poste */}
            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                Nom du poste
              </FieldLabel>
              <Input
                type="text"
                name="position"
                placeholder="Ex: Développeur Frontend"
                value={job.position}
                onChange={handleChange}
                className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </Field>

            {/* État de la candidature */}
            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                État de la candidature
              </FieldLabel>
              <Select
                value={job.status}
                onValueChange={(value) =>
                  setJob((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Choisis l'état de la candidature"
                    onChange={handleChange}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>États</SelectLabel>
                    <SelectItem value="Postulé">Candidature envoyée</SelectItem>
                    <SelectItem value="Entretien">Entretien</SelectItem>
                    <SelectItem value="Offre">Offre</SelectItem>
                    <SelectItem value="Refus">Refus</SelectItem>
                    <SelectItem value="Archivé">Archivé</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                Date de candidature
              </FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between text-left font-normal cursor-pointer"
                  >
                    {job.appliedDate
                      ? new Date(job.appliedDate).toLocaleDateString("fr-CA")
                      : "Choisir une date"}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={appliedDateAsDate}
                    onSelect={(date) => {
                      if (!date) return;

                      setJob((prev) => ({
                        ...prev,
                        appliedDate: date.toISOString().split("T")[0],
                      }));

                      setOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasFollowedUp"
                  checked={job.hasFollowedUp === 1}
                  onCheckedChange={(checked) =>
                    setJob((prev) => ({
                      ...prev,
                      hasFollowedUp: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="hasFollowedUp" className="text-sm">
                  Suivi effectué
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="canFollowUp"
                  checked={job.canFollowUp === 1}
                  onCheckedChange={(checked) =>
                    setJob((prev) => ({
                      ...prev,
                      canFollowUp: checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="canFollowUp" className="text-sm">
                  Suivi possible
                </Label>
              </div>
            </Field>

            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                Intérêt pour le poste
              </FieldLabel>
              <Select
                value={String(job.isInteresting ?? 2)}
                onValueChange={(value) =>
                  setJob((prev) => ({
                    ...prev,
                    isInteresting: Number(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau d’intérêt" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Intérêt</SelectLabel>
                    <SelectItem value="1">1 - Pas trop envie</SelectItem>
                    <SelectItem value="2">2 - Normal / neutre</SelectItem>
                    <SelectItem value="3">3 - Super motivée</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                Lien de loffre
              </FieldLabel>
              <Input
                type="url"
                name="jobLink"
                placeholder="https://..."
                value={job.jobLink ?? ""}
                onChange={handleChange}
                className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </Field>

            <Field className="flex flex-col">
              <FieldLabel className="mb-1 font-medium text-gray-700">
                Notes
              </FieldLabel>
              <textarea
                name="notes"
                placeholder="Ajouter des notes..."
                value={job.notes ?? ""}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:outline-none h-24"
              />
            </Field>

            {/* Submit */}
            <Button type="submit" variant="outline" className="cursor-pointer">
              Ajouter
            </Button>
          </FieldGroup>
        </FieldSet>
      </main>
    </div>
  );
}
