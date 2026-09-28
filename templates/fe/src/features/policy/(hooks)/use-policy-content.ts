import { policyContentMap, PolicyType } from "../(helpers)/policy-content-map";

export const usePolicyContent = (policy: PolicyType) => {
  return policyContentMap[policy] ?? {
    title: '',
    excerpt: '',
    content: '',
  };
}