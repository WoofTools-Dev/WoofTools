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
  price: string;
  percentage24H: number;
  score: number;
  contracts: string;
  created: string;
  volume: string;
  swaps: string;
  liquidity: string;
  TMCap: string;
  Dex: string[];
  actions: string[];
}



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  tokensList : TokenInfo[] = []
  filteredPairs: any[] = [];
  dataSource: any = null;


  constructor(
    private router: Router
  ) {
    this.tokensList = [
      {
        pairInfo: {
           swapIcon: "",
           chainIcon: "",
           token0Name:"OASCI",
           token1Name: "WETH",
           pairAddress: "0x187...1703",
  
        },
        price: "$0.003102",
        percentage24H: 38762.00,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: -2.00,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 6.72,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 12.78,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 12.78,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 12.78,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 12.78,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
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
        price: "$0.003102",
        percentage24H: 12.78,
        score: 64,
        contracts: "address",
        created: '2023-12-26 20:03:59',
        volume: "17.34M",
        swaps: "7.27K",
        liquidity: "283.71K",
        TMCap: "$3.83M",
        Dex: ["uniswap" , "eth"],
        actions: ['exchange logo']
      },
      
    ]

    this.filteredPairs = this.tokensList;
  }
   
  
   
   displayedColumns = [
    'pairInfo',
    'price',
    'percentage24H',
    'score',
    'contracts',
    'created',
    'volume',
    'swaps',
    'liquidity',
    'TMCap',
    'Dex',
    'actions',
   ];


   @ViewChild(MatSort) sort!: MatSort;
   @ViewChild(MatPaginator) paginator!: MatPaginator;
   

  search(event : any) {
    let value = event.target.value
    this.filteredPairs = this.tokensList.filter((item: any) => {
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

getTimeElapsed(dateTime: string): string {
  const currentDate = new Date();
  const inputDate = new Date(dateTime);

  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const hoursElapsed = Math.floor(timeDifference / (1000 * 60 * 60));
  const daysElapsed = Math.floor(hoursElapsed / 24);
  const yearsElapsed = Math.floor(daysElapsed / 365);

  if (yearsElapsed > 0) {
    return `${yearsElapsed} ${yearsElapsed === 1 ? 'year' : 'years'}`;
  } else if (daysElapsed > 0) {
    return `${daysElapsed} ${daysElapsed === 1 ? 'day' : 'days'}`;
  } else {
    return `${hoursElapsed} ${hoursElapsed === 1 ? 'hour' : 'hours'}`;
  }
}

}

