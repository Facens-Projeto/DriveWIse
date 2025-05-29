// src/models/Expense.ts

export type ExpenseType = 'fuel' | 'manual';

export interface ExpenseProps {
  id: string;
  date: string;       // ISO string, p.ex. new Date().toISOString()
  title: string;      // para fuel pode ser 'Abastecimento'
  value: number;      // em R$
  type: ExpenseType;
  liters?: number;    
  kmDriven?: number;  
  efficiency?: number;
}

export class Expense implements ExpenseProps {
  constructor(
    public id: string,
    public date: string,
    public title: string,
    public value: number,
    public type: ExpenseType,
    public liters?: number,
    public kmDriven?: number,
    public efficiency?: number,
  ) {}

  toJSON(): ExpenseProps {
    return {
      id: this.id,
      date: this.date,
      title: this.title,
      value: this.value,
      type: this.type,
      liters: this.liters,
      kmDriven: this.kmDriven,
      efficiency: this.efficiency,
    };
  }

  static fromJSON(o: ExpenseProps): Expense {
    return new Expense(
      o.id,
      o.date,
      o.title,
      o.value,
      o.type,
      o.liters,
      o.kmDriven,
      o.efficiency,
    );
  }
}
