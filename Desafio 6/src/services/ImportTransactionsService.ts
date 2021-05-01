import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  csvFileName: string;
}

interface TransactionDTO{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFileName }: RequestDTO): Promise<Transaction[]> {
    let transactionsCsvLines: Array<TransactionDTO> = []
    let transactionsSaved: Array<Transaction> = [];

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csvFileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      transactionsCsvLines.push({ title: line[0], type: line[1], value: line[2], category: line[3] })
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactionService = new CreateTransactionService();

    for await (const transaction of transactionsCsvLines) {
        transactionsSaved.push(
          await createTransactionService.execute(
            {
              title: transaction.title,
              value: transaction.value,
              type: transaction.type,
              category_title: transaction.category
            })
        )
    }

    return transactionsSaved;

  }
}

export default ImportTransactionsService;
