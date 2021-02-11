import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionType {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionType): Promise<Transaction> {
    console.log('-------------- CreateTransactionService --------------');
    const transactionsRepository = await getCustomRepository(
      TransactionsRepository,
    );
    const categoryRepository = getRepository(Category);

    const { total: totalBalance } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value >= totalBalance) {
      throw new AppError('O valor de retirada está acima do saldo total!', 400);
    }

    // get category
    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });
    let category_id;
    if (!categoryExists) {
      // salva categoria
      const categoryObj = categoryRepository.create({
        title: category,
      });
      const categoryRef = await categoryRepository.save(categoryObj);
      category_id = categoryRef.id;
    } else {
      // pega id da categoria
      category_id = categoryExists.id;
    }

    const transactionObj = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(transactionObj);
    return transactionObj;
  }
}

export default CreateTransactionService;
