import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce((accumulator: Balance, transaction: Transaction) => {
      switch(transaction.type){
        case "income":
          accumulator.income += parseFloat(transaction.value.toString());
          break;
        case "outcome":
          accumulator.outcome += parseFloat(transaction.value.toString());
          break;
        default:
          break;
      }

      return accumulator

    },{
      income: 0,
      outcome: 0,
      total: 0
    })

    const total = income - outcome

    return {income, outcome, total};
  }
}

export default TransactionsRepository;
