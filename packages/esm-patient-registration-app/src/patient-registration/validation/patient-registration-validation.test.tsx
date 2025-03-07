import React from 'react';
import { render, fireEvent, wait, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import { validationSchema } from './patient-registration-validation';
import { NameField } from '../field/name/name-field.component';
import { PatientRegistrationContext } from '../patient-registration-context';
import { initialFormValues } from '../patient-registration.component';
import { FormValues } from '../patient-registration-types';

const mockFieldConfigs = {
  name: {
    displayMiddleName: true,
  },
};
describe('name input', () => {
  const formValues: FormValues = initialFormValues;

  const testValidName = (givenNameValue: string, middleNameValue: string, familyNameValue: string) => {
    it(
      'does not display error message when givenNameValue: ' +
        givenNameValue +
        ', middleNameValue: ' +
        middleNameValue +
        ', familyNameValue: ' +
        familyNameValue,
      async () => {
        const error = await updateNameAndReturnError(givenNameValue, middleNameValue, familyNameValue);
        Object.values(error).map((currentError) => expect(currentError).toBeNull());
      },
    );
  };

  const testInvalidName = (
    givenNameValue: string,
    middleNameValue: string,
    familyNameValue: string,
    expectedError: string,
    errorType: string,
  ) => {
    it(
      'displays error message when givenNameValue: ' +
        givenNameValue +
        ', middleNameValue: ' +
        middleNameValue +
        ', familyNameValue: ' +
        familyNameValue,
      async () => {
        const error = (await updateNameAndReturnError(givenNameValue, middleNameValue, familyNameValue))[errorType];
        expect(error.textContent).toEqual(expectedError);
      },
    );
  };

  const updateNameAndReturnError = async (givenNameValue: string, middleNameValue: string, familyNameValue: string) => {
    render(
      <Formik
        initialValues={{
          givenName: '',
          middleName: '',
          familyName: '',
        }}
        onSubmit={null}
        validationSchema={validationSchema}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              identifierTypes: [],
              validationSchema,
              setValidationSchema: () => {},
              fieldConfigs: mockFieldConfigs,
              values: formValues,
              inEditMode: false,
              setFieldValue: () => null,
            }}>
            <NameField />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );
    const givenNameInput = screen.getByLabelText('Given Name') as HTMLInputElement;
    const middleNameInput = screen.getByLabelText('Middle Name') as HTMLInputElement;
    const familyNameInput = screen.getByLabelText('Family Name') as HTMLInputElement;

    fireEvent.change(givenNameInput, { target: { value: givenNameValue } });
    fireEvent.blur(givenNameInput);
    fireEvent.change(middleNameInput, { target: { value: middleNameValue } });
    fireEvent.blur(middleNameInput);
    fireEvent.change(familyNameInput, { target: { value: familyNameValue } });
    fireEvent.blur(familyNameInput);

    await wait();

    return {
      givenNameError: screen.queryByText('Given name is required'),
      middleNameError: screen.queryByText('Middle name is required'),
      familyNameError: screen.queryByText('Family name is required'),
    };
  };

  testValidName('Aaron', 'A', 'Aaronson');
  testValidName('No', '', 'Middle Name');
  testInvalidName('', '', '', 'Given name is required', 'givenNameError');
  testInvalidName('', '', '', 'Family name is required', 'familyNameError');
  testInvalidName('', 'No', 'Given Name', 'Given name is required', 'givenNameError');
  testInvalidName('No', 'Family Name', '', 'Family name is required', 'familyNameError');
});
