import { useEffect, useState } from "react";
import { loadWizard, saveWizard, clearWizard } from "../storage/signUpStorage";
import { type SignUpWizardData } from "../types";

export function useSignUpWizard() {
  const [data, setData] = useState<SignUpWizardData>(() => {
    return (
      loadWizard() || {
        step: 1,
        account: {
          name: "",
          email: "",
          password: "",
          bio: "",
          state_id: 0,
          city_id: 0,
        },
        genres: [],
        books: { read: [], reading: [] },
      }
    );
  });

  useEffect(() => {
    saveWizard(data);
  }, [data]);

  function update<K extends keyof SignUpWizardData>(
    key: K,
    value: SignUpWizardData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function nextStep() {
    // console.log("Next step", { data }, data.step);
    setData((prev) => ({ ...prev, step: prev.step + 1 }));
    // console.log(data, data.step);
  }

  function prevStep() {
    setData((prev) => ({ ...prev, step: prev.step - 1 }));
  }

  function reset() {
    clearWizard();
    setData({
      step: 1,
      account: {
        name: "",
        email: "",
        password: "",
        bio: "",
        state_id: 0,
        city_id: 0,
      },
      genres: [],
      books: { read: [], wantRead: [] },
    });
  }

  return { data, update, nextStep, prevStep, reset };
}
