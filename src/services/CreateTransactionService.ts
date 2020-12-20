// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionType {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionType): Promise<Transaction> {
    // TODO
    const transactionsRepository = await getRepository(TransactionsRepository);
    const transaction = transactionsRepository.create({
      //transaction_id,
      title,
      value,
      type,
      category,
    });
    await TransactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
