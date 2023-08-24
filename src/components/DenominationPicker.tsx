import { Grid, View } from "@aws-amplify/ui-react";
import React, { useState } from "react";

import "./DenominationPicker.css";

/**
 * A way of picking the denomination of gift card to buy.
 */
function DenominationPicker(props: Properties) {
    const [otherValue, setOtherValue] = useState<string>("");
    const [otherSelected, setOtherSelected] = useState<boolean>(false);

    const options = props.options ?? [5, 10, 25, 50, 100];

    return (
        <View className="DenominationPicker">
            <Grid gap="0.5em" templateColumns={{
                base: "1fr",
                small: "1fr",
                medium: "1fr 1fr",
                large: "1fr 1fr 1fr",
                xl: "1fr 1fr 1fr 1fr",
            }}>
                {options.map((option, index) => (
                    <React.Fragment key={`denomination-option-${index}`}>
                        <DenominationOption
                            disabled={props.disabled}
                            value={`$${option.toFixed(props.includeCents === true ? 2 : 0)}`}
                            selected={!otherSelected && option === props.value}
                            onSelect={() => {
                                setOtherSelected(false);
                                setOtherValue("");
                                props.onValueChange(option)
                            }}
                        />
                    </React.Fragment>
                ))}
                {props.allowOther !== false && <OtherDenominationOption
                    disabled={props.disabled}
                    value={otherValue}
                    selected={otherSelected}
                    minValue={props.minValue}
                    maxValue={props.maxValue}
                    onSelect={() => setOtherSelected(true)}
                    onChange={value => {
                        setOtherValue(value);
                        const parsedValue = parseFloat(value.startsWith("$") ? value.substring(1) : value);
                        if (validateOtherValue(parsedValue, props.minValue, props.maxValue))
                            props.onValueChange(parsedValue);
                    }} />}
            </Grid>
        </View>
    );
}

function DenominationOption(
    { value, selected, onSelect, disabled }: { value: string, selected: boolean, disabled?: boolean, onSelect: () => void }
) {
    return (
        <View
            className={selected ? "DenominationOption DenominationOption-Selected" : "DenominationOption"}
            onClick={() => !disabled && onSelect()}
        >
            {value}
        </View>
    );
}

function OtherDenominationOption(
    { value, minValue, maxValue, selected, onSelect, onChange, disabled }: { value: string, minValue?: number, maxValue?: number, selected: boolean, disabled?: boolean, onSelect: () => void, onChange: (newValue: string) => void }
) {
    const valid = validateOtherValue(parseFloat(value.startsWith("$") ? value.substring(1) : value), minValue, maxValue);

    const classes = [
        "OtherDenominationOption",
        selected && "OtherDenominationOption-Selected",
        !valid && "OtherDenominationOption-Invalid"
    ]
        .filter(x => !!x)
        .join(" ");

    return (
        <input
            disabled={disabled}
            type="text"
            inputMode="decimal"
            className={classes}
            value={value}
            placeholder="Other"
            onFocus={event => {
                if (disabled)
                    return;
                event.target.select();
                onSelect();
            }}
            onClick={event => {
                if (disabled)
                    return;
                onSelect();
                event.stopPropagation();
                return false;
            }}
            onChange={e => !disabled && onChange(e.target.value)}
            onBlur={e => {
                if (!disabled && valid && !e.target.value.startsWith("$"))
                    onChange("$" + e.target.value);
            }}
        />
    );
}

function validateOtherValue(value: number, minValue?: number, maxValue?: number) {
    return value > (minValue ?? 0) && value < (maxValue ?? Infinity) && Number.isFinite(value);
}

interface Properties {
    options?: number[];
    allowOther?: boolean;
    minValue?: number; // Default 5
    maxValue?: number; // Default 100
    value: number | null;
    onValueChange: (value: number) => void;
    includeCents?: boolean;
    disabled?: boolean;
}

export default DenominationPicker;
