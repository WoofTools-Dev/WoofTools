import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-counter',
  templateUrl: './time-counter.component.html',
  styleUrls: ['./time-counter.component.css']
})
export class TimeCounterComponent {

  @Input() startTime: string = ''; // Input property to receive the start time
  formattedTime: string = ''; // Variable to store formatted time

  ngOnInit() {
    this.updateTime();
    setInterval(() => {
      this.updateTime();
    }, 1000); // Update every second
  }

  updateTime() {
    const startDate = new Date(this.startTime).getTime();
    const currentTime = new Date().getTime();
    const difference = (currentTime - startDate) / 1000; // Difference in seconds
  
    const seconds = Math.floor(difference % 60);
    const minutes = Math.floor((difference / 60) % 60);
    const hours = Math.floor((difference / 3600) % 24);
    const days = Math.floor(difference / (3600 * 24));
    const months = Math.floor(days / 30); // Assuming 30 days in a month
  
    if (months > 0) {
      this.formattedTime = `${months} month ${days % 30} d ${hours} h ${minutes} m ${seconds} ss`;
    } else if (days > 0) {
      this.formattedTime = `${days} d ${hours} h ${minutes} m ${seconds} ss`;
    } else if (hours > 0) {
      this.formattedTime = `${hours} h ${minutes} m ${seconds} ss`;
    } else if (minutes > 0) {
      this.formattedTime = `${minutes} m ${seconds} ss`;
    } else {
      this.formattedTime = `${seconds} ss`;
    }
  }
}
