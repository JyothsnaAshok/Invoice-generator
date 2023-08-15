"use client";

import Image from "next/image";
import ReactSplit, { SplitDirection } from "@devbookhq/splitter";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import styles from "./page.module.scss";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Table,
} from "antd";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { message, Upload, Space } from "antd";
import Icon, { UploadOutlined } from "@ant-design/icons";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const onFinish = (values) => {
  console.log("Received values of form:", values);
};

const dateFormat = "DD/MM/YYYY";

const HeartSvg = () => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.21875 3.79048C2.90766 3.79048 2.65547 4.04267 2.65547 4.35376V13.3663C2.65547 13.5079 2.7077 13.6372 2.79395 13.7362L9.79993 7.04864C10.0726 6.78835 10.4994 6.78078 10.7811 7.03122L12.7945 8.8209V4.35376C12.7945 4.04267 12.5423 3.79048 12.2313 3.79048H3.21875ZM12.7945 10.7498C12.7673 10.7315 12.7409 10.7112 12.7157 10.6888L10.3175 8.55702L4.68912 13.9295H12.2313C12.5423 13.9295 12.7945 13.6773 12.7945 13.3663V10.7498ZM1.20703 4.35376C1.20703 3.24272 2.10771 2.34204 3.21875 2.34204H12.2313C13.3423 2.34204 14.243 3.24272 14.243 4.35376V13.3663C14.243 14.4773 13.3423 15.378 12.2313 15.378H3.21875C2.10771 15.378 1.20703 14.4773 1.20703 13.3663V4.35376ZM5.47188 6.36548C5.33855 6.36548 5.23047 6.47356 5.23047 6.60689C5.23047 6.74021 5.33855 6.84829 5.47188 6.84829C5.6052 6.84829 5.71328 6.74021 5.71328 6.60689C5.71328 6.47356 5.6052 6.36548 5.47188 6.36548ZM3.78203 6.60689C3.78203 5.67361 4.5386 4.91704 5.47188 4.91704C6.40514 4.91704 7.16172 5.67361 7.16172 6.60689C7.16172 7.54015 6.40514 8.29673 5.47188 8.29673C4.5386 8.29673 3.78203 7.54015 3.78203 6.60689Z"
      fill="#787868"
    />
  </svg>
);

const HeartIcon = (props) => <Icon component={HeartSvg} {...props} />;

export default function Home() {
  const printRef = useRef();

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    // Join invoice name and invoice number to create a unique file name
    let name = invoiceName.split(" ").join("-");
    pdf.save(name + ".pdf");
  };

  const [modalOpen, setModalOpen] = useState(false);

  const [invoiceName, setInvoiceName] = useState("");
  const [fromCompany, setFromCompany] = useState({
    pan: "",
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    state: "",
  });

  const [toCompany, setToCompany] = useState({
    pan: "",
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    state: "",
  });

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([
    {
      name: "",
      qty: 0,
      price: "",
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const [notes, setNotes] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        qty: 0,
        price: "",
      },
    ]);

    let sum = 0;
    let qtyTotal = 0;

    for (let i = 0; i < items.length; i++) {
      sum += items[i].qty * items[i].price;
      qtyTotal += items[i].qty;
    }

    setTotal(sum + (sum * tax) / 100);
    setQuantity(qtyTotal);
    setSubtotal(sum);
  };

  const deleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);

    setItems(newItems);

    let sum = 0;
    let qtyTotal = 0;

    for (let i = 0; i < items.length; i++) {
      sum += items[i].qty * items[i].price;
      qtyTotal += items[i].qty;
    }

    setTotal(sum + (sum * tax) / 100);

    setQuantity(qtyTotal);
    setSubtotal(sum);
  };

  const changeItem = (index, name, qty, price) => {
    const newItems = [...items];
    newItems[index].name = name;
    newItems[index].qty = qty;
    newItems[index].price = price;
    setItems(newItems);

    // calculate subtotal
    let sum = 0;
    let qtyTotal = 0;

    for (let i = 0; i < items.length; i++) {
      sum += items[i].qty * items[i].price;
      qtyTotal += items[i].qty;
    }

    setTotal(sum + (sum * tax) / 100);
    setQuantity(qtyTotal);
    setSubtotal(sum);
  };

  const itemsTableColumns = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (text, record) => <span>₹{record.qty * record.price}</span>,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        Create an Invoice
        <div>
          <Button
            className={styles.buttonPrimary}
            icon={<ArrowsAltOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Preview
          </Button>
          <Button
            className={styles.buttonSecondary}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <ReactSplit
          direction={SplitDirection.Horizontal}
          minWidths={[200, 500]} // In pixels.
        >
          <div className={styles.contentLeft}>
            <span>
              Fill in all the required fields, preview your invoice and get it
              emailed directly to you.
            </span>
            <div className={styles.form}>
              <div className={styles.rowSpace}>
                <Input
                  size="large"
                  placeholder="Invoice Name"
                  style={{
                    width: "48%",
                  }}
                  onChange={(e) => setInvoiceName(e.target.value)}
                />
                <Upload className={styles.row} size="large">
                  <Button icon={<HeartIcon />} size="large">
                    Click to Upload <Divider type="vertical" />
                    <UploadOutlined />
                  </Button>
                </Upload>
              </div>
              <Divider />
              <div className={styles.rowSpace}>
                <div
                  className={styles.col}
                  style={{
                    width: "48%",
                  }}
                >
                  Your company info
                  <Form
                    layout="vertical"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <Form.Item>
                      <Input
                        placeholder="PAN or GSTIN"
                        size="large"
                        name="pan"
                        onChange={(e) => {
                          setFromCompany({
                            ...fromCompany,
                            pan: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Name"
                        size="large"
                        name="name"
                        onChange={(e) => {
                          setFromCompany({
                            ...fromCompany,
                            name: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Email"
                        size="large"
                        name="email"
                        onChange={(e) => {
                          setFromCompany({
                            ...fromCompany,
                            email: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Address"
                        size="large"
                        name="address"
                        onChange={(e) => {
                          setFromCompany({
                            ...fromCompany,
                            address: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                    <div className={styles.rowSpace}>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="City"
                          size="large"
                          name="city"
                          onChange={(e) => {
                            setFromCompany({
                              ...fromCompany,
                              city: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="ZIP Code"
                          size="large"
                          name="zip"
                          onChange={(e) => {
                            setFromCompany({
                              ...fromCompany,
                              zip: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className={styles.rowSpace}>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="Country"
                          size="large"
                          name="country"
                          onChange={(e) => {
                            setFromCompany({
                              ...fromCompany,
                              country: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="State"
                          size="large"
                          name="state"
                          onChange={(e) => {
                            setFromCompany({
                              ...fromCompany,
                              state: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>
                  </Form>
                </div>
                <div
                  className={styles.col}
                  style={{
                    width: "48%",
                  }}
                >
                  Bill To
                  <Form
                    layout="vertical"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <Form.Item>
                      <Input
                        placeholder="PAN or GSTIN"
                        size="large"
                        onChange={(e) => {
                          setToCompany({ ...toCompany, pan: e.target.value });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Name"
                        size="large"
                        onChange={(e) => {
                          setToCompany({ ...toCompany, name: e.target.value });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Email"
                        size="large"
                        onChange={(e) => {
                          setToCompany({ ...toCompany, email: e.target.value });
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input
                        placeholder="Address"
                        size="large"
                        onChange={(e) => {
                          setToCompany({
                            ...toCompany,
                            address: e.target.value,
                          });
                        }}
                      />
                    </Form.Item>
                    <div className={styles.rowSpace}>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="City"
                          size="large"
                          onChange={(e) => {
                            setToCompany({
                              ...toCompany,
                              city: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="ZIP Code"
                          size="large"
                          onChange={(e) => {
                            setToCompany({ ...toCompany, zip: e.target.value });
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className={styles.rowSpace}>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="Country"
                          size="large"
                          onChange={(e) => {
                            setToCompany({
                              ...toCompany,
                              country: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          width: "48%",
                        }}
                      >
                        <Input
                          placeholder="State"
                          size="large"
                          onChange={(e) => {
                            setToCompany({
                              ...toCompany,
                              state: e.target.value,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
              Invoice info
              <div className={styles.rowSpace}>
                <div
                  className={styles.col}
                  style={{
                    width: "48%",
                  }}
                >
                  <Input
                    placeholder="Invoice Number"
                    size="large"
                    onChange={(e) => setInvoiceNo(e.target.value)}
                  />
                </div>

                <div
                  className={styles.col}
                  style={{
                    width: "48%",
                  }}
                >
                  <div className={styles.rowSpace}>
                    <DatePicker
                      size="large"
                      style={{
                        width: "48%",
                      }}
                      format={dateFormat}
                      onChange={(date, dateString) => {
                        setInvoiceDate(dateString);
                      }}
                    />

                    <DatePicker
                      size="large"
                      style={{
                        width: "48%",
                      }}
                      format={dateFormat}
                      onChange={(date, dateString) => {
                        setDueDate(dateString);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                Items to Bill
                <br />
                {items.map((item, idx) => {
                  return (
                    <Space
                      key={idx}
                      style={{
                        display: "flex",
                        marginBottom: 8,
                      }}
                      align="baseline"
                    >
                      <Form.Item
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Missing item",
                          },
                        ]}
                        value={item.name}
                      >
                        <Input
                          placeholder="Item Name"
                          size="large"
                          defaultValue={item.name}
                          onChange={(e) => {
                            changeItem(
                              idx,
                              e.target.value,
                              item.qty,
                              item.price
                            );
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="qty"
                        rules={[
                          {
                            required: true,
                            message: "Missing last name",
                          },
                        ]}
                      >
                        <InputNumber
                          placeholder="Quantity"
                          size="large"
                          onChange={(e) => {
                            changeItem(idx, item.name, e, item.price);
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="price"
                        rules={[
                          {
                            required: true,
                            message: "Price",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Price"
                          size="large"
                          onChange={(e) => {
                            changeItem(
                              idx,
                              item.name,
                              item.qty,
                              e.target.value
                            );
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={["total"]}
                        rules={[
                          {
                            required: true,
                            message: "Total",
                          },
                        ]}
                      >
                        <Input
                          // add a rupee symbol before the value
                          placeholder={"₹" + " " + item.qty * item.price}
                          size="large"
                          disabled
                        />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => deleteItem(idx)} />
                    </Space>
                  );
                })}
                <Button
                  className={styles.buttonSecondary}
                  onClick={addItem}
                  block
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </div>
              <div className={styles.rowSpace}>
                <div
                  className={styles.col}
                  style={{
                    width: "48%",
                  }}
                >
                  <TextArea
                    rows={4}
                    placeholder="Notes/Memo (Optional)"
                    onChange={(e) => {
                      setNotes(e.target.value);
                    }}
                    showCount
                    maxLength={100}
                  />
                </div>
                <div className={styles.col}>
                  <div className={`${styles.rowSpace} ${styles.staticContent}`}>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <Input
                    placeholder="GST (%)"
                    size="large"
                    onChange={(e) => {
                      setTax(e.target.value);
                      setTotal(subtotal + (subtotal * e.target.value) / 100);
                    }}
                    suffix="%"
                  />

                  <div className={`${styles.rowSpace} ${styles.staticContent}`}>
                    <span>Tax</span>
                    <span>₹{(tax / 100) * subtotal}</span>
                  </div>

                  <div className={`${styles.rowSpace} ${styles.staticContent}`}>
                    <span
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      Total
                    </span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentRight}>
            <div className={styles.invoice} ref={printRef}>
              <h2>{invoiceName}</h2>
              <div className={styles.rowStart}>
                <div className={styles.invoiceInfo}>
                  Invoice #:{invoiceNo}
                  <br />
                  Invoice date: {invoiceDate}
                  <br />
                  Due date: {dueDate}
                </div>

                <div className={styles.col}>
                  <div className={styles.invoiceFromHeader}>Bill From:</div>
                  <div className={styles.invoiceFromContent}>
                    <div>{fromCompany.name}</div>
                    <div>{fromCompany.address}</div>
                    <div>
                      {fromCompany.city}, {fromCompany.state} {fromCompany.zip}{" "}
                    </div>
                    {fromCompany.country}
                    <br />
                    {fromCompany.email}
                    <br />
                    {fromCompany.pan === "" ? null : (
                      <div> GSTIN: {fromCompany.pan}</div>
                    )}
                  </div>
                </div>

                <div className={styles.col}>
                  <div className={styles.invoiceFromHeader}>Bill To:</div>
                  <div className={styles.invoiceFromContent}>
                    <div>{toCompany.name}</div>
                    <div>{toCompany.address}</div>
                    <div>
                      {toCompany.city}, {toCompany.state} {toCompany.zip}{" "}
                    </div>
                    {toCompany.country}
                    <br />
                    {toCompany.email}
                    <br />
                    {toCompany.pan === "" ? null : (
                      <div> GSTIN: {toCompany.pan}</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Add an extra row at the end with sum of qty and price */}
              <Table
                columns={itemsTableColumns}
                dataSource={items}
                pagination={false}
              />
              <div className={styles.rowStart}>
                <div className={styles.notes}>
                  <h6>Notes/Memo</h6>
                  {/*  render notes with line breaks */}
                  {notes.split("\n").map((i, key) => {
                    return <div key={key}>{i}</div>;
                  })}
                </div>
                <div className={styles.invoiceTotal}>
                  <div className={styles.invoiceTotalItem}>
                    Subtotal: <span>₹{subtotal}</span>
                  </div>
                  <div className={styles.invoiceTotalItem}>
                    GST({tax}%): <span>₹{(tax / 100) * subtotal}</span>
                  </div>
                  <b>
                    <div className={styles.invoiceTotalItem}>
                      Total: <span>₹{total}</span>
                    </div>
                  </b>
                </div>
              </div>
            </div>
          </div>
        </ReactSplit>
        <Modal open={modalOpen} onCancel={() => setModalOpen(false)}>
          <div className={styles.invoice}>
            <h2>{invoiceName}</h2>
            <div className={styles.rowStart}>
              <div className={styles.invoiceInfo}>
                Invoice #:{invoiceNo}
                <br />
                Invoice date: {invoiceDate}
                <br />
                Due date: {dueDate}
              </div>

              <div className={styles.col}>
                <div className={styles.invoiceFromHeader}>Bill From:</div>
                <div className={styles.invoiceFromContent}>
                  <div>{fromCompany.name}</div>
                  <div>{fromCompany.address}</div>
                  <div>
                    {fromCompany.city}, {fromCompany.state} {fromCompany.zip}{" "}
                  </div>
                  {fromCompany.country}
                  <br />
                  {fromCompany.email}
                  <br />
                  {fromCompany.pan === "" ? null : (
                    <div> GSTIN: {fromCompany.pan}</div>
                  )}
                </div>
              </div>

              <div className={styles.col}>
                <div className={styles.invoiceFromHeader}>Bill To:</div>
                <div className={styles.invoiceFromContent}>
                  <div>{toCompany.name}</div>
                  <div>{toCompany.address}</div>
                  <div>
                    {toCompany.city}, {toCompany.state} {toCompany.zip}{" "}
                  </div>
                  {toCompany.country}
                  <br />
                  {toCompany.email}
                  <br />
                  {toCompany.pan === "" ? null : (
                    <div> GSTIN: {toCompany.pan}</div>
                  )}
                </div>
              </div>
            </div>
            {/* Add an extra row at the end with sum of qty and price */}
            <Table
              columns={itemsTableColumns}
              dataSource={items}
              pagination={false}
            />
            <div className={styles.rowStart}>
              <div className={styles.notes}>
                <h6>Notes/Memo</h6>
                {/*  render notes with line breaks */}
                {notes.split("\n").map((i, key) => {
                  return <div key={key}>{i}</div>;
                })}
              </div>
              <div className={styles.invoiceTotal}>
                <div className={styles.invoiceTotalItem}>
                  Subtotal: <span>₹{subtotal}</span>
                </div>
                <div className={styles.invoiceTotalItem}>
                  GST({tax}%): <span>₹{(tax / 100) * subtotal}</span>
                </div>
                <b>
                  <div className={styles.invoiceTotalItem}>
                    Total: <span>₹{total}</span>
                  </div>
                </b>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
