import * as moment from 'moment';

export default function (Base) {
  return class extends Base {
    _date(value) {
      const _ = moment(value);

      return {
        year: _.year(),
        month: _.month(),
        date: _.date(),
        day: _.day()
      };
    }
  }
}