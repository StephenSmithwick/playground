package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"

	ct "github.com/google/certificate-transparency-go"
	ctTls "github.com/google/certificate-transparency-go/tls"
	ctX509 "github.com/google/certificate-transparency-go/x509"
)

type CertData struct {
	LeafInput string `json:"leaf_input"`
	ExtraData string `json:"extra_data"`
}

type CertLog struct {
	Entries []CertData
}

func getCerts(start int64, end int64) CertLog {

	url := fmt.Sprintf("https://ct.googleapis.com/logs/us1/argon2024/ct/v1/get-entries?start=%d&end=%d", start, end)
	resp, err := http.Get(url)

	if err != nil {
		fmt.Println(err)
	}

	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)

	var results CertLog
	json.Unmarshal(buf.Bytes(), &results)

	return results

}

func testSslCertMonitor(startIndex int64, endIndex int64) {

	total := 0

	for i := startIndex; i < endIndex; i += 20 {
		certs := getCerts(i, i+19)

		for _, cert := range certs.Entries {
			total++
			testBytes, _ := base64.RawStdEncoding.DecodeString(cert.LeafInput)

			var test ct.MerkleTreeLeaf
			ctTls.Unmarshal(testBytes, &test)

			switch eType := test.TimestampedEntry.EntryType; eType {
			case 0:
				cert, _ := ctX509.ParseCertificate(test.TimestampedEntry.X509Entry.Data)

				for _, domain := range cert.DNSNames {

					fmt.Println(domain)
					fmt.Println("====================")

				}

			case 1:
				cert, _ := ctX509.ParseTBSCertificate(test.TimestampedEntry.PrecertEntry.TBSCertificate)
				for _, domain := range cert.DNSNames {

					fmt.Println(domain)
					fmt.Println("====================")

				}

			default:
				// TODO(pavelkalinnikov): Section 4.6 of RFC6962 implies that unknown types
				// are not errors. We should revisit how we proccess this case.
				fmt.Printf("unknown entry type: %v", eType)
			}

		}
	}

	fmt.Println(total)

}

func main() {
	testSslCertMonitor(218772510, 218772520)
}
