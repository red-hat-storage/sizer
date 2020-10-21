import {
  Flex,
  NumberInput,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Text,
  Box
} from "@chakra-ui/core";
import React from "react";

interface MyInputProps {
  label: string;
}

export const MyInput: React.FC<MyInputProps> = ({ label, children }) => {
  return (
    <FormControl mt={4}>
      <FormLabel mb={1}>{label}:</FormLabel>
      {children}
    </FormControl>
  );
};

interface MyOutputProps {
  label: string;
}

export const MyOutput: React.FC<MyOutputProps> = ({ label, children }) => {
  return (
    <Flex my={1} wrap="wrap">
      <Text flex="0 0 16em">{label}:</Text>
      <Box flex="0 0 1em" />
      <Text flex="1 0 22em" fontWeight="900" color="#5F0000">
        {children}
      </Text>
    </Flex>
  );
};

interface MySliderProps {
  value: number;
  setValue: (a: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const MySlider: React.FC<MySliderProps> = ({
  value,
  setValue,
  min = 1,
  max = 100,
  step = 1
}) => {
  const handleChange = (value: number | string) => setValue(Number(value));

  return (
    <Flex>
      <Slider
        size="sm"
        flex="1"
        min={min}
        max={max}
        step={step}
        color="red"
        value={value}
        onChange={handleChange}
      >
        <SliderTrack />
        <SliderFilledTrack />
        <SliderThumb fontSize="xs" color="black" size="3em" children={value} />
      </Slider>
      <NumberInput
        size="sm"
        maxW="85px"
        ml={12}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  );
};
