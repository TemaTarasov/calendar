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

    get content() {
      const content = document.querySelector('.rcs-inner-container');
      const { height } = content.getBoundingClientRect();
      const { scrollTop, offsetTop } = content;

      return {
        content,
        height,
        scrollTop,
        offsetTop
      };
    }
  }
}