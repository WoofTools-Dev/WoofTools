import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CoinGeckoService } from 'src/app/Service/coin-gecko.service';
import { CoinGeckoInterface } from 'src/app/Interface/coin-gecko.interface';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
export interface TokenInfo {
  pairInfo: any;
  executionTime: string;
  type: "SELL" | "BUY";
  quantity: string;
  totalETH: string;
  totalUSD: string;
  variation: number;
  maker: string;
  actions: string[];
}



@Component({
  selector: 'app-big-swap-explorer',
  templateUrl: './big-swap-explorer.component.html',
  styleUrls: ['./big-swap-explorer.component.css']
})
export class BigSwapExplorerComponent implements OnInit {
  pairList : TokenInfo[] = []
  filteredPairs: any[] = [];
  dataSource: any = null;


  constructor(
    private router: Router
  ) {
    this.pairList = [
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 12.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 94.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 77.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 24.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 90.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 55.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 97.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 4.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 65.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 18.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 12.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 30.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 40.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "SELL",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 90.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        executionTime: '2023-12-26 20:03:59',
        type: "BUY",
         quantity: "56.1607",
      totalETH: "56.1608",
      totalUSD: "$133,297",
      variation: 80.13,
      maker: "0x3a67b1 ...49ca",
      actions: ['exchange logo']
      },
    ]


    this.filteredPairs = this.pairList;
  }
   

  //  ELEMENT_DATA: TokenInfo[] = 

   displayedColumns = [
    'pairInfo',
    'executionTime',
    'type',
    'quantity',
    'totalETH',
    'totalUSD',
    'variation',
    'maker',
    'actions',
   ];

   @ViewChild(MatSort) sort!: MatSort;
   @ViewChild(MatPaginator) paginator!: MatPaginator;
   

  search(event : any) {
    let value = event.target.value
    this.filteredPairs = this.pairList.filter((item: any) => {
      return (
        item.pairInfo.token0Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.token1Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.pairAddress.toLowerCase().includes(value.toLowerCase()) ||
        item.tokenPriceUSD.toLowerCase().includes(value.toLowerCase()))
    })

    this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs)
  }



  
ngOnInit(): void { 
  this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs)
  
// // var myHeaders = new Headers();
// // myHeaders.append("Content-Type", "application/json");
// // myHeaders.append("X-API-KEY", "BQYk6LYFsSq5Fv8CazRDoSTJP9fUTzgX");
// // myHeaders.append("Authorization", "Bearer ory_at_cnNdjIcukuSe6uC8qOy8jpNCalX5HIGL8wEVZ9WUpyg.GkMgEI0QLuidfjDbyP3FxDku2dK579K-j9mf6fbjRX8");

// // var raw = JSON.stringify({
// //    "query": "{\n  ethereum(network: ethereum) {\n    arguments(\n      options: {desc: [\"block.height\", \"index\"], limit: 50}\n      smartContractEvent: {is: \"PairCreated\"}\n    ) {\n      block {\n        height\n        timestamp {\n          time(format: \"%Y-%m-%d %H:%M:%S\")\n        }\n      }\n      smartContract {\n        address {\n          address\n          annotation\n        }\n      }\n      index\n      pair: any(of: argument_value, argument: {is: \"pair\"})\n      token0: any(of: argument_value, argument: {is: \"token0\"})\n      token0Name: any(of: argument_value, argument: {is: \"token0\"}, as: token_name)\n      token1: any(of: argument_value, argument: {is: \"token1\"})\n      token1Name: any(of: argument_value, argument: {is: \"token1\"}, as: token_name)\n     }\n  }\n}\n",
// //    "variables": "{}"
// // });

// // var requestOptions : any = {
// //    method: 'POST',
// //    headers: myHeaders,
// //    body: raw,
// //    redirect: 'follow'
// // };

// // fetch("https://graphql.bitquery.io", requestOptions)
// //    .then(response => response.text())
// //    .then((result : any) => {
// //     console.log(JSON.parse(result).data.ethereum.arguments)
// //     this.pairList = JSON.parse(result).data.ethereum.arguments
// //    })
// //    .catch(error => console.log('error', error));
// //   }
//   navigate(routerCoin: string) {
//     this.router.navigateByUrl('routerCoin');
//   }
}
ngAfterViewInit() {
  if (this.sort && this.paginator) {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}

generateAvatarInitials(name: string): string {
  const nameParts = name.split(' ');
  const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
  return initials;
}

}

