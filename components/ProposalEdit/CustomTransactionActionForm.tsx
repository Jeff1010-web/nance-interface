import { ErrorMessage } from "@hookform/error-message";
import { FunctionFragment, FormatTypes, Interface } from "ethers/lib/utils";
import { useState, useEffect, useCallback, useContext } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  TenderlySimulationAPIResponse,
  encodeTransactionInput,
} from "@/utils/hooks/TenderlyHooks";
import FunctionSelector from "./FunctionSelector";
import TenderlySimulationButton from "@/components/TenderlySimulation/TenderlySimulationButton";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import StringForm from "../form/StringForm";
import BooleanForm from "../form/BooleanForm";
import SafeInjectIframeCard from "../SafeInjectIframeCard";
import { useSafeInject } from "../SafeInjectIframeCard/context/SafeInjectedContext";
import { BigNumber } from "ethers";
import { CustomTransactionArg } from "@/models/NanceTypes";
import { NetworkContext } from "@/context/NetworkContext";
import { getChainByNetworkName } from "config/custom-chains";

export default function CustomTransactionActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string | undefined;
}) {
  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();
  const [functionData, setFunctionData] = useState<string>();
  const [shouldSimulate, setShouldSimulate] = useState<boolean>();

  const { latestTransaction, setAddress, address } = useSafeInject();
  const {
    watch,
    control,
    formState: { errors },
    getValues,
    getFieldState,
    setValue,
  } = useFormContext();
  const { replace, fields } = useFieldArray({ name: genFieldName("args") });

  const args = functionFragment?.inputs?.map((param, index) =>
    getValues(genFieldName(`args.${index}.value`)),
  );
  const input = encodeTransactionInput(
    functionFragment?.format(FormatTypes.minimal) || "",
    args || [],
  );
  const networkName = useContext(NetworkContext);
  const networkId = getChainByNetworkName(networkName).id;

  const simulateArgs = {
    from: projectOwner || "",
    to: getValues(genFieldName("contract")) as string,
    value: parseInt(getValues(genFieldName("value"))),
    input,
    networkId
  };

  useEffect(() => {
    if (latestTransaction) {
      setValue(genFieldName("contract"), latestTransaction.to);
      setValue(
        genFieldName("value"),
        BigNumber.from(latestTransaction.value).toString(),
      );
      setFunctionData(latestTransaction.data);
      // decode function name and args from data
      console.debug("latestTransaction", latestTransaction);
    }
  }, [latestTransaction, setValue]);

  useEffect(() => {
    // if the function input changed, we need to re-run simulation
    setShouldSimulate(false);
  }, [
    getFieldState(genFieldName("args")).isDirty,
    getValues(genFieldName("functionName")),
  ]);

  // update address if project owner changed
  useEffect(() => {
    if (address !== projectOwner) {
      setAddress(projectOwner);
    }
  }, [projectOwner, setAddress]);

  const onSimulated = useCallback(
    (
      data: TenderlySimulationAPIResponse | undefined,
      shouldSimulate: boolean,
    ) => {
      const simulationId = data?.simulation?.id;
      const simulationStatus = data?.simulation?.status;

      if (simulationId) {
        setValue(genFieldName("tenderlyId"), simulationId);
      }

      if (shouldSimulate) {
        setValue(
          genFieldName("tenderlyStatus"),
          simulationStatus ? "true" : "false",
        );
      } else {
        setValue(genFieldName("tenderlyStatus"), "false");
      }
    },
    [setValue],
  );

  return (
    <div>
      <div className="mt-6 grid grid-cols-4 gap-6">
        <TenderlySimulationButton
          simulationArgs={simulateArgs}
          shouldSimulate={!!projectOwner && !!input && !!shouldSimulate}
          setShouldSimulate={setShouldSimulate}
          onSimulated={onSimulated}
        />

        <div className="col-span-4 sm:col-span-2">
          <AddressForm label="Contract" fieldName={genFieldName("contract")} />
        </div>

        <div className="col-span-4 sm:col-span-1">
          <UIntForm label="ETH Value" fieldName={genFieldName("value")} />
        </div>

        {watch(genFieldName("contract"))?.length === 42 && (
          <div className="col-span-4 sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Function
            </label>
            <Controller
              name={genFieldName("functionName")}
              control={control}
              rules={{
                required: "Can't be empty",
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <FunctionSelector
                  address={watch(genFieldName("contract"))}
                  val={value}
                  setVal={onChange}
                  setFunctionFragment={(f) => {
                    setFunctionFragment(f);

                    if (functionData) {
                      // load args from latest transaction
                      const iface = new Interface([f]);
                      const decoded = iface.decodeFunctionData(
                        f.name,
                        functionData,
                      );
                      const args = decoded.map((v) => v);

                      args.forEach((arg, index) => {
                        setValue(genFieldName(`args.${index}`), arg);
                      });
                      replace(
                        args.map((v, index) => ({
                          value: v,
                          type: f.inputs[index].type,
                          name: f.inputs[index].name,
                        })),
                      );
                      // clear this one-time data that we got from latest transaction
                      setFunctionData(undefined);
                    } else {
                      // reset args
                      replace(
                        f.inputs?.map((param) => {
                          return {
                            value: "",
                            type: param.type,
                            name: param.name,
                          };
                        }) || [],
                      );
                    }
                  }}
                  inputStyle="h-10"
                  functionData={functionData}
                />
              )}
            />
            <ErrorMessage
              errors={errors}
              name={genFieldName("functionName")}
              render={({ message }) => (
                <p className="mt-1 text-red-500">{message}</p>
              )}
            />
          </div>
        )}

        {(fields as unknown as CustomTransactionArg[]).map((field, index) => (
          <div key={field.id} className="col-span-4 sm:col-span-1">
            {field.type === "address" && (
              <AddressForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
              />
            )}

            {field.type.includes("int") && (
              <UIntForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
                fieldType={field.type}
              />
            )}

            {field.type === "bool" && (
              <BooleanForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
              />
            )}

            {field.type !== "address" &&
              !field.type.includes("int") &&
              field.type !== "bool" && (
              <StringForm
                label={`Param: ${field.name || "_"}`}
                fieldName={genFieldName(`args.${index}.value`)}
                fieldType={field.type}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SafeInjectIframeCard />
      </div>
    </div>
  );
}
