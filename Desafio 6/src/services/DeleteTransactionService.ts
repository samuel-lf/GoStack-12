import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';

interface RequestDTO {
  transaction_id: string;
}

class DeleteTransactionService {
  public async execute({transaction_id}: RequestDTO): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if(!transaction_id){
      throw new AppError('Transaction ID has be empty');
    }

    const transaction = transactionsRepository.findOne({where: {id: transaction_id}})

    if(!transaction){
      throw new AppError('Transaction not found');
    }

    await transactionsRepository.delete({id: transaction_id});
  }
}

export default DeleteTransactionService;
