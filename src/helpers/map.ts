import { each } from 'lodash';

type MapSeriesIteratee<T, U> = (value: T, index: number) => Promise<U>;
type Dictionary<T> = {
  [index: string]: T;
};
type DictionaryChainPromiseIteratee<T, U> = (value: T, index: string) => Promise<U>;
/**
 * Runs an array of async functions serially one after another.
 *
 * @param values - Array of values to iterate over.
 * @param iteratee - Iteratee function that returns as promise.
 */
export function mapSeries<T, U>(
  values: Dictionary<T>,
  iteratee: DictionaryChainPromiseIteratee<T, U>
): Promise<U[]>;
export function mapSeries<T, U>(values: T[], iteratee: MapSeriesIteratee<T, U>): Promise<U[]>;
export function mapSeries<T, U>(
  values: T[] & Dictionary<T[]>,
  iteratee: MapSeriesIteratee<T, U> & DictionaryChainPromiseIteratee<T, U>
): Promise<U[]> {
  let prom = Promise.resolve();

  const results: U[] = [];
  each(values, (value, index) => {
    prom = prom
      .then(() => iteratee(value, index))
      .then((res) => {
        results.push(res);
      });
  });

  return prom.then(() => results);
}
