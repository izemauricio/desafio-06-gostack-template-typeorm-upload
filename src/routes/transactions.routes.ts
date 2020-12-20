import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';

// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  // title, value, type, e category
  // type = income para entradas (depósitos) e outcome para saídas (retiradas)
  // salvar no banco: id, title, value, type, category_id, created_at, updated_at.
  const { title, value, type, category } = request.body;
  const CreateTransaction = new CreateTransactionService();
  const transaction = await CreateTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.json({ transaction });
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const DeleteTransactionService = new DeleteTransactionService();
  await DeleteTransactionService.execute();
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
