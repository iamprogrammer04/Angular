import { Component, OnInit } from '@angular/core';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { TablesDataService } from '../data.service';
import { TablesKitchenSinkEditComponent } from './edit/edit.component';

@Component({
  selector: 'app-table-kitchen-sink',
  templateUrl: './kitchen-sink.component.html',
  styleUrls: ['./kitchen-sink.component.scss'],
  providers: [TablesDataService],
})
export class TablesKitchenSinkComponent implements OnInit {
  columns: MtxGridColumn[] = [
    {
      header: this.translate.stream('usersManager.position'),
      field: 'position',
      sortable: true,
      minWidth: 100,
      width: '100px',
    },
    {
      header: this.translate.stream('usersManager.title'),
      field: 'title',
      sortable: true,
      minWidth: 100,
      width: '100px',
    },
    {
      header: this.translate.stream('usersManager.userName'),
      field: 'userName',
      sortable: true,
      disabled: true,
      minWidth: 100,
      width: '100px',
    },
    {
      header: this.translate.stream('usersManager.fullName'),
      field: 'fullName',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.email'),
      field: 'email',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.roles'),
      field: 'roles',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.phoneNumber'),
      field: 'phoneNumber',
      hide: true,
      minWidth: 120,
    },
    {
      header: this.translate.stream('usersManager.operation'),
      field: 'operation',
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.translate.stream('usersManager.edit'),
          click: record => this.edit(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('usersManager.delete'),
          pop: {
            title: this.translate.stream('usersManager.confirm_delete'),
            closeText: this.translate.stream('usersManager.close'),
            okText: this.translate.stream('usersManager.ok'),
          },
          click: record => this.delete(record),
        },
      ],
    },
  ];
  list: any[] = [];
  isLoading = true;

  multiSelectable = true;
  rowSelectable = true;
  hideRowSelectionCheckbox = false;
  showToolbar = true;
  columnHideable = true;
  columnSortable = true;
  columnPinnable = true;
  rowHover = false;
  rowStriped = false;
  showPaginator = true;
  expandable = false;
  columnResizable = false;

  constructor(
    private translate: TranslateService,
    private dataSrv: TablesDataService,
    private dialog: MtxDialog
  ) {}

  ngOnInit() {
    this.list = this.dataSrv.getData();
    this.isLoading = false;
  }

  edit(value: any) {
    const dialogRef = this.dialog.originalOpen(TablesKitchenSinkEditComponent, {
      width: '600px',
      data: { record: value },
    });

    dialogRef.afterClosed().subscribe(() => console.log('The dialog was closed'));
  }

  delete(value: any) {
    this.dialog.alert(`You have deleted ${value.position}!`);
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  enableRowExpandable() {
    this.columns[0].showExpand = this.expandable;
  }
}
