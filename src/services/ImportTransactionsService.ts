import { getCustomRepository, getRepository, In } from 'typeorm';
import parser from 'csv-parse';
import fs from 'fs'; // from nodejs

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionObject {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  /*
    Recebe o filepath do arquivo texto csv
    O middleware muler ja salvou os bytes nesse filepath
    Abrir e fazer parse
    */
  async execute(filePath: string): Promise<Transaction[]> {
    // create a stream object from file descriptor
    const contactsReadStream = fs.createReadStream(filePath);

    // create the parser object
    const parseObj = parser({
      // first line is number 1, so this avoid the header line
      from_line: 2,
    });

    // send the stream to the parser
    const parseCSV = contactsReadStream.pipe(parseObj);

    // array to store each transaction and cateogry
    const transactions: TransactionObject[] = [];
    const categories: string[] = [];

    // each line on the file = "title, type, value, category\n"
    // define function of event of stream, which will populate the arrays
    parseCSV.on('data', async chunk => {
      // chunk = array de string de cada coluna da linha do csv =  ["title", "type", "value", "category"]
      const colunas = chunk;
      // remove external spaces from each string on the array
      const colunasSemEspaco = colunas.map((cell: string) => cell.trim());
      // explode the array: grab the value of each index (start at 0)
      const [title, type, value, category] = colunasSemEspaco;
      // ignore line if it has not complete values
      if (!title || !type || !value) return;
      // insert into arrays
      categories.push(category); // category string title
      transactions.push({ title, type, value, category }); // object
    });
    // wait promise here until the stream fires the end event (resolve)
    await new Promise(resolve => parseCSV.on('end', resolve));

    // CATEGORY REPOSITORY
    const categoriesRepository = getRepository(Category);

    // find category where title IN [cat1, cat2, cat3, ...]
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });
    // existentCategories = [{id, title, created_at, updated_at}:Category, ...]

    // create array containing only the title of each category
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );
    // existentCategoriesTitles = ["catTitle1", "catTitle2",...]

    // find categories that do not exist in the database
    // categories = ["title1", "title2", "title3"]
    // existentCategoriesTitles = ["title2"]
    // addCategoryTitles = []
    const addCategoryTitles = categories
      // adiciona se string NAO esta no array existentCategoriesTitles
      // add to addCategoryTitles if
      .filter(category => !existentCategoriesTitles.includes(category))
      // filter out unique values = extract unique values = only allow one unit of each string title in the array
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    // array of string ["catTitle1", "catTitle2",]

    // array of string ["catTitle1"] to array of object title [{title:"catTitle1"}, ...]
    const catToCreate = addCategoryTitles.map(title => ({
      title,
    }));
    const newCategories = categoriesRepository.create(catToCreate);
    await categoriesRepository.save(newCategories);

    // faz merge das categorias criadas com existentes
    const finalCategories = [...newCategories, ...existentCategories];

    const transcationRepository = getCustomRepository(TransactionsRepository);

    // create array of objects [{transaction1}, ...]
    const transactionsToCreate = transactions.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: transaction.value,
      // encontra categoria cujo title === obj.category
      category: finalCategories.find(
        category => category.title === transaction.category,
      ),
    }));
    /*
    transactionsToCreate = array of transactions objects = [{
    title: 'Loan',
    type: 'income',
    value: 'NEW_A',
    category: Category {
      title: '1500',
      id: '255ba15b-e301-4a1b-8548-843cef05c4ed',
      created_at: 2021-02-06T05:01:16.507Z,
      updated_at: 2021-02-06T05:01:16.507Z
    }
    },
    ...]
    */
    const createdTransactions = transcationRepository.create(
      transactionsToCreate,
    );
    await transcationRepository.save(createdTransactions);

    // termina filesystem
    await fs.promises.unlink(filePath);

    /*
    createdTransactions = array of Transaction database objects = [Transaction {
    title: 'Loan',
    type: 'income',
    value: '1500',
    category_id: '9eeab2bb-db2d-452a-ac02-deeae9f8c464',
    category: Category {
      id: '9eeab2bb-db2d-452a-ac02-deeae9f8c464',
      title: 'NEW_A',
      created_at: 2021-02-06T01:54:27.116Z,
      updated_at: 2021-02-06T01:54:27.116Z
    },
    id: 'b2f3730d-7d2f-42e0-a41e-735293cdb685'
  },
  Transaction2
    */
    return createdTransactions;
  }
}

export default ImportTransactionsService;
