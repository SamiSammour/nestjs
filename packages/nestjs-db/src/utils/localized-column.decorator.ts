import { addAttribute, isDataType, getSequelizeTypeByDesignType } from 'sequelize-typescript';
import { ModelAttributeColumnOptions, DataType, DataTypes } from 'sequelize';
import { Locals } from './enum/locals.enum';
import { format } from 'util';

export function LocalizedColumn(dataType: DataType): Function;
export function LocalizedColumn(options: Partial<ModelAttributeColumnOptions>): Function;
export function LocalizedColumn(target: any, propertyName: string, propertyDescriptor?: PropertyDescriptor): void;
export function LocalizedColumn(...args: any[]): Function | void {

  // In case of no specified options, we infer the
  // sequelize data type by the type of the property
  if (args.length >= 2) {

    const target = args[0];
    const propertyName = args[1];
    const propertyDescriptor = args[2];

    annotate(target, propertyName, propertyDescriptor);
    return;
  }

  return (target: any, propertyName: string, propertyDescriptor?: PropertyDescriptor) => {
    annotate(target, propertyName, propertyDescriptor, args[0]);
  };
}

function annotate(target: any,
                  propertyName: string,
                  propertyDescriptor?: PropertyDescriptor,
                  optionsOrDataType: Partial<ModelAttributeColumnOptions> | DataType = {}): void {

  let options: Partial<ModelAttributeColumnOptions>;

  if (isDataType(optionsOrDataType)) {

    options = {
      type: optionsOrDataType
    };
  } else {

    options = {...(optionsOrDataType as ModelAttributeColumnOptions)};

    if (!options.type) {
      options.type = getSequelizeTypeByDesignType(target, propertyName);
    }
  }

  if (propertyDescriptor) {
    if (propertyDescriptor.get) {
      options.get = propertyDescriptor.get;
    }
    if (propertyDescriptor.set) {
      options.set = propertyDescriptor.set;
    }
  }

  const localization = {};
  for (const [locale, fieldTemplate] of Object.entries(Locals)) {
    const localizedFieldName = format(fieldTemplate, propertyName);
    localization[locale] = localizedFieldName;
    addAttribute(target, localizedFieldName, options);
  }
  const virtualOptions = Object.assign(options, {
    ...options,
    type: DataTypes.VIRTUAL(DataTypes.STRING, Object.values(localization)),
    allowNull: undefined,
    localization,
    get() {
      const fieldTemplate = Locals[this.$locale || 'en'];
      const localizedFieldName = format(fieldTemplate, this.rawAttributes.name.field);
      return this[localizedFieldName];
    }
  });
  addAttribute(target, propertyName, virtualOptions);
}
