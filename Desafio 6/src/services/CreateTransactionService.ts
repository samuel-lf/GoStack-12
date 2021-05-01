import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string
}

class CreateTransactionService {
  public async execute({title, value, type, category_title}: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if(!category_title){
      throw new AppError('Category has be empty');
    }

    if(!["income", "outcome"].includes(type)){
      throw new AppError('This transaction type is invalid');
    }

    const { total } = await transactionsRepository.getBalance();

    if(type === 'outcome' && total < value){
      throw new AppError('O valor de saída é maior que o valor total atual');
    }

    const categoryRespository = getRepository(Category);

    const categoryFound: Category | undefined = await categoryRespository.findOne({where: {title: category_title}});
    let category: Category | undefined = categoryFound;

    if(!categoryFound){
      category = categoryRespository.create({title: category_title})
      await categoryRespository.save(category);
    }

    const transaction = transactionsRepository.create({title, value, type, category});

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
