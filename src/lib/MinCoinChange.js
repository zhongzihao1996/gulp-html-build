//最少硬币找零
function MinCoinChange(coins_list) {
  const cache = {}; // 缓存结果集
  this.makeChange = amount => {
    if (!amount) {
      return [];
    }
    // 避免重复计算所造成的时间浪费
    if (cache[amount]) {
      return cache[amount];
    }
    let min = []; // 最终结果数组
    let newMin; // 符合条件的找零数组
    let newAmount; // 找零钱数
    // 我们循环coins的长度。通过循环，我们为每一个conis数组中的面额都进行下面的逻辑操作。（主要是为当前coin做递归）
    for (let i = 0; i < coins_list.length; i++) {
      // 选择coins中的当前面额。
      let coin = coins_list[i];
      // 我们用要找零的钱数减去当前要找零的面额。并存储为newAmount变量。
      newAmount = amount - coin;
      // 在当前循环的递归中，如果newAmount是不小于0的值，也就是合法的找零的钱数，我们同样为该数调用找零方法。
      // 这里就是有点类似分而治之的那种策略了，递归求解。
      if (newAmount >= 0) {
        newMin = this.makeChange(newAmount);
        console.log(newMin);
      }
      // 在前面符合条件的newAmount递归后会进入下一个值得逻辑执行，然后就会到这里的逻辑判断
      // 下面的if判断主要是判断是否是当前的最优解，如果是，那么就放入我们最终的数组内。
      //   console.log(!min.length, min.length);
      if (
        newAmount >= 0 &&
        (newMin.length < min.length - 1 || !min.length) &&
        (newMin.length || !newAmount)
      ) {
        min = [coin].concat(newMin);
        // console.log("new Min" + min + "for" + amount);
      }
    }
    //cache存储了1到amount之间的所有结果
    return (cache[amount] = min);
  };
}

let minCoinChange = new MinCoinChange([1, 5, 10, 25]);
console.log(minCoinChange.makeChange(5));
