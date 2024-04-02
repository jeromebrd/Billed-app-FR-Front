/**
 * @jest-environment jsdom
 */

import {
  fireEvent,
  getByTestId,
  getByText,
  screen,
  waitFor,
} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills';
import store from '../__mocks__/store.js';
import Router from '../app/Router';

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
  })
);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then, I should test bill icon in vertical layout should be highlighted', async () => {
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      Router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
    test('Then bills should be ordered from earliest to latest', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const datesSorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(datesSorted);
    });

    test('When I click on the icon eye', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const modale = document.getElementById('modaleFile');
      $.fn.modal = jest.fn(() => modale.classList.add('show'));
      const handleClickIconEye = jest.fn(
        () => billsContainer.handleClickIconEye
      );
      const iconEye = screen.getAllByTestId('icon-eye')[1];

      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);
      expect(handleClickIconEye).toHaveBeenCalled();

      expect(modale.classList).toContain('show');
    });

    test('When I click on close modal', () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const billsContainer = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const modale = document.getElementById('modaleFile');
      $.fn.modal = jest.fn(() => modale.classList.add('show'));
      const modaleClose = screen.getByTestId('modaleClose');

      modale.addEventListener(
        'click',
        jest.fn(() => modale.classList.remove('show'))
      );
      userEvent.click(modaleClose);

      expect(modale.classList).not.toContain('show');
    });

    describe('When I click on the New bill button', () => {
      test('Then I should be redirected to new bill form', () => {
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const billsContainer = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });

        const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
        const newBillButton = screen.getByTestId('btn-new-bill');
        newBillButton.addEventListener('click', handleClickNewBill);
        userEvent.click(newBillButton);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      });
    });
  });

  test('Loading page bill', () => {
    const bill = BillsUI({ data: bills, loading: true });
    document.body.innerHTML = bill;

    expect(screen.getAllByText('Loading...')).toBeTruthy();
  });

  test('error page bill', () => {
    const bill = BillsUI({ data: bills, loading: false, error: 'Oups !' });
    document.body.innerHTML = bill;

    expect(screen.getAllByText('Erreur')).toBeTruthy();
  });

  // test d'intégration GET
  describe('Given I am a user connected as Employee', () => {
    describe('When I navigate to BillUI', async () => {
      const billsContainer = new Bills({
        document,
        localStorage: localStorageMock,
        firestore: { bills: () => store },
      });
      const bills = await billsContainer.getBills();

      test('fetches bills from mock API GET', async () => {
        const getSpy = jest.spyOn(billsContainer, 'getBills');
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(bills.data.length).toBe(4);
      });
      test('fetches bills from an API and fails with 404 error mesage', async () => {
        billsContainer
          .getBills()
          .mockImplementationOnce(() =>
            Promise.reject(new Error('Erreur 404'))
          );
        const html = BillsUI({ error: 'Erreur 404' });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test('fetches messages from an API and fails with 500 error mesage', async () => {
        billsContainer
          .getBills()
          .mockImplementationOnce(() =>
            Promise.reject(new Error('Erreur 500'))
          );
        const html = BillsUI({ error: 'Erreur 500' });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });

      test('Then, filter email is user Local', async () => {
        const userEmail = JSON.parse(localStorageMock.getItem('user')).email;

        expect(userEmail).toBeTruthy();
      });
    });
  });
});
