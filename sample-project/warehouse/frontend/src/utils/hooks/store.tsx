import { Dispatch, State, Store } from "@/src/store";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes<Dispatch>();
export const useAppSelector = useSelector.withTypes<State>();
export const useAppStore = useStore.withTypes<Store>();