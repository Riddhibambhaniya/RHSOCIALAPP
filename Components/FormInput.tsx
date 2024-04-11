// FormInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface FormInputProps extends TextInputProps {
  labelValue: string;
  onChangeText: (text: string) => void;
  placeholderText: string;
  iconType: string;
}

const FormInput: React.FC<FormInputProps> = ({
  labelValue,
  onChangeText,
  placeholderText,
  iconType,
  ...rest
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.iconStyle}>
        <AntDesign name={iconType} size={25} color="#666" />
      </View>
      <TextInput
        value={labelValue}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder={placeholderText}
        placeholderTextColor="#666"
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconStyle: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#ccc',
    borderRightWidth: 1,
    width: 50,
  },
  input: {
    padding: 10,
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#333',
  },
});

export default FormInput;
