export { }

declare global {
  interface String {
    lower: () => string;
    upper: () => string;
    capFirst: () => string;
    capWords: () => string;
    truncateWords: (number: number) => string;
    truncateWordsWithHtml: (number: number) => string;
    stripHtml: () => string;
    escapeHtml: () => string;
    toBool: () => boolean;
    contains: (val: string) => boolean;
    slugify: (lower?: boolean) => string;
    getValueByKey: (key: string) => string;
    setValueByKey: (key: string, replacement: string) => string;
  }

  interface StringConstructor {
    isNullOrEmpty: (val: any) => boolean;
  }

}

String.prototype.lower = function (): string {
  return this.toLowerCase();
};

String.prototype.upper = function (): string {
  return this.toUpperCase();
};

String.prototype.capFirst = function (): string {
  if (this.length == 1) {
    return this.toUpperCase();
  }
  else if (this.length > 0) {
    let regex: RegExp = /^(\(|\[|"|')/;
    if (regex.test(this)) {
      return this.substring(0, 2).toUpperCase() + this.substring(2);
    }
    else {
      return this.substring(0, 1).toUpperCase() + this.substring(1);
    }
  }
  return null;
};

String.prototype.capWords = function (): string {
  let regexp: RegExp = /\s/;
  let words = this.split(regexp);
  if (words.length == 1) {
    return words[0].capFirst();
  }
  else if (words.length > 1) {
    let result: string = '';
    for (let i = 0; i < words.length; i++) {
      if (words[i].capFirst() !== null) {
        result += words[i].capFirst() + ' ';
      }
    }
    result.trim();
    return result;
  }
  return null;
};

String.prototype.truncateWords = function (num: number): string {
  let words: Array<string> = this.split(/\s+/);
  if (words.length > num) {
    return words.slice(0, num).join(' ');
  }
  return words.join(' ');
};

String.prototype.truncateWordsWithHtml = function (num: number): string {
  let tags: Array<string> = [];
  let truncation: string = this.truncateWords(num);
  let matches: RegExpMatchArray = truncation.match(/<[\/]?([^> ]+)[^>]*>/g);
  for (let i: number = 0; i < matches.length; i++) {
    let opening: string = matches[i].replace('/', '');
    if (matches[i].indexOf('/') != -1 && tags.indexOf(opening) != -1) {
      (<any>tags).remove(opening);
    }
    else if (matches[i].indexOf('/') != -1) {
      continue;
    }
    else {
      tags.push(matches[i]);
    }
  }
  for (let i: number = 0; i < tags.length; i++) {
    truncation += tags[i].replace('<', '</').replace(/(\s*)(\w+)=("[^<>"]*"|'[^<>']*'|\w+)/g, '');
  }
  return truncation;
};

String.prototype.stripHtml = function (): string {
  let content: string = this.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace('&nbsp;', ' ');
  content = content.replace('&amp;', '&');
  return content;
};

String.prototype.escapeHtml = function (): string {
  let content: string = this.replace(/"/g, '&quot;');
  content.replace(/&(?!\w+;)/g, '&amp;');
  content.replace(/>/g, '&gt;');
  content.replace(/</g, '&lt;');
  return content;
};

String.prototype.toBool = function (): boolean {
  if ((<any>String).isNullOrEmpty(this)) {
    return false;
  }
  else if (this.lower() === "true" || this.lower() === "1" || this.lower() === "y" || this.lower() === "t") {
    return true;
  }
  return false;
};

String.prototype.contains = function (val: string): boolean {
  if (this.indexOf(val) !== -1) {
    return true;
  }
  return false;
};

String.prototype.slugify = function (lower: boolean = true): string {
  if (!lower) {
    return this.lower().normalize().replace(/[^a-z0-9]/gi, '-');
  }
  return this.normalize().replace(/[^a-z0-9]/gi, '-');
};

String.prototype.getValueByKey = function (key: string): string {
  var collection: Array<string> = this.split(";");
  for (let i = 0; i < collection.length; i++) {
    if (collection[i].contains(":")) {
      let pairs = collection[i].split(":");
      if (pairs[0] == key) {
        return pairs[1];
      }
    }
  }
  return '';
};

String.prototype.setValueByKey = function (key: string, replacement: string): string {
  var collection: Array<string> = this.split(";");
  var returnCollection: Array<string> = [];
  for (let i = 0; i < collection.length; i++) {
    if (collection[i].contains(":")) {
      let pairs = collection[i].split(":");
      if (pairs[0] == key) {
        pairs[1] = replacement;
      }
      returnCollection.push(pairs.join(":"));
    }
  }
  return returnCollection.join(';');
};

String.isNullOrEmpty = function (val: any): boolean {
  if (val === undefined || val === null || val.trim() === '') {
    return true;
  }
  return false;
};
