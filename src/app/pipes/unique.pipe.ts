import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique',
  standalone: true
})
export class UniquePipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    if (!value || !key) {
      return value;
    }
    
    // Use a Set to store unique values based on the key
    const uniqueItems = value.filter((item, index, self) => 
      self.findIndex(i => i[key] === item[key]) === index
    );

    return uniqueItems;
  }
}
