import { Text, TextProps } from 'react-native';

const formatter = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
});

type PriceTextProps = TextProps & {
  amount: number;
};

export function PriceText({ amount, ...props }: PriceTextProps) {
  return <Text {...props}>{formatter.format(amount)}</Text>;
}
