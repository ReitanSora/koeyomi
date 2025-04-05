import { ToastAndroid } from "react-native";

interface ToastProps {
    message: string;
    duration?: number;
}

export default function Toast({message, duration = ToastAndroid.LONG}: ToastProps) {
    ToastAndroid.showWithGravityAndOffset(
        message,
        duration,
        ToastAndroid.BOTTOM,
        25,
        50,
    );
};
