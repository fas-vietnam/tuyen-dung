import Vue from 'vue';
import locale from 'element-ui/lib/locale';
import lang from 'element-ui/lib/locale/lang/en';

import {
	// Pagination,
	// Dialog,
	// Autocomplete,
	// Dropdown,
	// DropdownMenu,
	// DropdownItem,
	// Menu,
	// Submenu,
	// MenuItem,
	// MenuItemGroup,
	// Input,
	// InputNumber,
	// Radio,
	// RadioGroup,
	// RadioButton,
	// Checkbox,
	// CheckboxButton,
	// CheckboxGroup,
	// Switch,
	// Select,
	// Option,
	// OptionGroup,
	// Button,
	// ButtonGroup,
	Table,
	TableColumn,
	DatePicker,
	// TimeSelect,
	// TimePicker,
	// Popover,
	// Tooltip,
	// Breadcrumb,
	// BreadcrumbItem,
	Form,
	FormItem,
	// Tabs,
	// TabPane,
	// Tag,
	// Tree,
	// Alert,
	// Slider,
	// Icon,
	Row,
	Col,
	// Upload,
	Progress,
	// Badge,
	// Card,
	// Rate,
	// Steps,
	// Step,
	// Carousel,
	// CarouselItem,
	// Collapse,
	// CollapseItem,
	// Cascader,
	// ColorPicker,
	// Transfer,
	// Container,
	// Header,
	// Aside,
	// Main,
	// Footer,
	Loading,
	// MessageBox,
	// Message,
	Notification,
} from 'element-ui';

// Vue.use(Pagination);
// Vue.use(Dialog);
// Vue.use(Autocomplete);
// Vue.use(Input);
// Vue.use(InputNumber);
// Vue.use(Checkbox);
// Vue.use(Select);
// Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
// Vue.use(Popover);
// Vue.use(Tooltip);
// Vue.use(Form);
// Vue.use(FormItem);
// Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
// Vue.use(Progress);
Vue.use(Loading);
locale.use(lang);
