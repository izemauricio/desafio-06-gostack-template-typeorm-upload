import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import uploadConfig from '../config/upload.config';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const uploadMiddleware = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO: retorna todas as transactions
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO: cria nova transaction
  const { title, value, type, category } = request.body;
  const CreateTransaction = new CreateTransactionService();
  const transaction = await CreateTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO: delete transaction id
  const transactin_id = request.params.id;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(transactin_id);
  return response.status(200).json({ status: 'transaction deleted' });
});

// aplica uploadMiddleware para esta rota apenas
transactionsRouter.post(
  '/import',
  uploadMiddleware.single('file'), // faz upload de 1 arquivo que esta no campo file
  async (request, response) => {
    // TODO: importa transactions from file
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(request.file.path);
    return response
      .status(200)
      .json({ filename: request.file.path, transactions });
  },
);

export default transactionsRouter;
