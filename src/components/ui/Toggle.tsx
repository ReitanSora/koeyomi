import { Theme } from '@/theme';
import { Host, Switch } from '@expo/ui/jetpack-compose';

interface ToggleSwitchProps {
    checked: boolean;
    setChecked: () => void;
    colors?: {
        checkedThumbColor?: string;
        checkedTrackColor?: string;
        checkedBorderColor?: string;
        uncheckedThumbColor?: string;
        uncheckedTrackColor?: string;
        uncheckedBorderColor?: string;
    };
}

export default function ToggleSwitch({ checked, setChecked, colors }: ToggleSwitchProps) {
    return (
        <Host matchContents>
            <Switch
                value={checked}
                onCheckedChange={setChecked}
                colors={{
                    uncheckedBorderColor: colors?.uncheckedBorderColor ?? Theme.colors.midGray  ,
                    uncheckedThumbColor: colors?.uncheckedThumbColor ?? Theme.colors.midGray ,
                    uncheckedTrackColor: colors?.uncheckedTrackColor ?? Theme.colors.jetgray ,
                    checkedThumbColor: colors?.checkedThumbColor ?? Theme.colors.gunmetalGray ,
                    checkedTrackColor: colors?.checkedTrackColor ?? Theme.colors.vermillion ,
                }}
            />
        </Host>
    );
}
