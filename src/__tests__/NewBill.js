/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import userEvent from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then, it should them in the page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Admin',
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;
      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage,
      });
      //to-do write assertion

      const expenseType = screen.getByTestId('expense-type');
      fireEvent.change(expenseType, { target: { value: 'Transport' } });

      const expenseName = screen.getByTestId('expense-name');
      fireEvent.change(expenseName, { target: { value: 'Essence' } });

      const expenseAmount = screen.getByTestId('amount');
      fireEvent.change(expenseAmount, { target: { value: 50 } });

      const expenseCommentary = screen.getByTestId('commentary');
      fireEvent.change(expenseCommentary, {
        target: { value: 'Pour le trajet à mon travail' },
      });

      const expensePct = screen.getByTestId('pct');
      fireEvent.change(expensePct, { target: { value: 20 } });

      const form = screen.getByTestId('form-new-bill');
      const handleClick = jest.fn(newBill.handleSubmit);
      form.addEventListener('click', handleClick);
      userEvent.click(form);

      //expect(expenseType.value).toBeTruthy()
      expect(expenseName.value).toBeTruthy();
      expect(expenseAmount.value).toBeTruthy();
      expect(expenseCommentary.value).toBeTruthy();
      expect(expensePct.value).toBeTruthy();
      expect(handleClick).toHaveBeenCalled();
    });

    test('Test, function change file', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const input = screen.getByTestId('file');
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      input.addEventListener('change', handleChangeFile);

      const fileTrue = new File(['testFile'], 'testFile.jpg', {
        type: 'image/jpg',
      });

      userEvent.upload(input, fileTrue);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0]).toStrictEqual(fileTrue);
      expect(input.files).toHaveLength(1);
      expect(window.alert).toHaveBeenCalled();
      expect(fileTrue.type).toContain('image/jpg');
    });
  });
});
