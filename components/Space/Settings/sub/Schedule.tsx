import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { GovernanceCycleForm } from "@/components/CreateSpace";
import { SpaceConfig } from "@/models/NanceTypes";
import { parseISO } from "date-fns";

export default function Schedule({ spaceConfig, edit }: { spaceConfig: SpaceConfig; edit?: boolean}) {
  return ( <GovernanceCycleForm disabled={!edit} /> );
}
